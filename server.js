const express = require('express');
const mysql = require('mysql');
const util = require('util')
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const db = mysql.createConnection
({
    host: 'localhost',
    user: 'root',
    password: 'jorus28',
    database: 'quickserved_db'
});

const query = util.promisify(db.query).bind(db);

db.connect
(
    err => {
        if(err) {
            console.error('🔴 ERROR connecting to MySQL:', err.stack);
            return;
        }
        console.log('🟢 Connected to MySQL Workbench DB.')
    }
)

async function processOrderComplexity(item_list) 
{
    let totalScore = 0;
    let hasHardItem = false;
    const HARD_ITEMS_THRESHOLD = 6;

    for(const item of item_list){
        const sql = 'SELECT complexity_score FROM menu_items WHERE item_id = ?';
        const results = await query(sql, [item.item_id]);

        if(results.length > 0){
            const score = results[0].complexity_score;
            totalScore += score * item.qty;
            
            if(score >= HARD_ITEMS_THRESHOLD){
                hasHardItem = true;
            }
        }
    }
    return{
        totalScore: totalScore,
        hasHardItem: hasHardItem
    };
}

app.post('/api/orders', async (req, res) => {
    // 1. Kuhanin ang lahat ng data na ipinadala ng frontend (menuOrder.js)
    const { 
        table_id, // Galing sa selectedTable.id
        subtotal, 
        service_fee, 
        total_amount, 
        items // May item_id, name, qty, at price
    } = req.body;

    if (!items || items.length === 0 || !table_id) {
        return res.status(400).json({ error: 'Missing order details or empty cart.' });
    }

    try {
        // A. CALCULATE COMPLEXITY SCORE (Para sa prioritization)
        // Note: Ginagamit natin ang 'items' dito, hindi 'items_list'
        const complexity_results = await processOrderComplexity(items);
        const calculated_queue_type = complexity_results.hasHardItem ? 'HARD' : 'EASY'; 
        
        // B. INSERT INTO 'orders' TABLE (Header)
        // *Dinagdag ang subtotal, service_fee, total_amount, at total_complexity_score*
        const orderQuery = `
            INSERT INTO orders (table_id, queue_type, subtotal, service_fee, total_amount, total_complexity_score, order_status) 
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
        `;
        
        // **Ginamit ang 'query' function na may 'await'**
        const orderResult = await query(orderQuery, [
            table_id, 
            calculated_queue_type,
            subtotal, 
            service_fee, 
            total_amount,
            complexity_results.totalScore
        ]);
        const orderId = orderResult.insertId;

        // C. INSERT INTO 'order_items' TABLE (Line Items)
        const itemQuery = `
            INSERT INTO order_items (order_id, item_id, item_name, quantity, price_at_order) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        for (const item of items) {
            // **Ito ang CRITICAL PART na kulang sa lumang code mo!**
            await query(itemQuery, [
                orderId, 
                item.item_id, 
                item.name, 
                item.qty, // Ginamit ang 'qty' (quantity)
                item.price
            ]);
        }
        
        // D. SUCCESS RESPONSE: Ibalik ang details
        res.status(201).json({ 
            order_id: orderId,
            table_id: table_id,
            total_amount: total_amount,
            subtotal: subtotal,
            service_fee: service_fee,
            queue_type: calculated_queue_type,
            total_score: complexity_results.totalScore
            // HINDI na natin kailangan ibalik ang 'items' dito, 
            // kukunin na lang ng frontend ang listahan mula sa 'orderPayload'
        });

    } catch (error) {
        // Tiyakin na nagla-log tayo ng error
        console.error('Database insertion error for order:', error);
        res.status(500).json({ error: 'Failed to submit order to database.' });
    }
});

app.get('/api/menu', async (req, res) => {
    const sql = 'SELECT item_id, item_name, price, category, complexity_score FROM menu_items ORDER BY category, item_name'; 
    try{
        const results = await query(sql);
        res.json(results);
    }catch(err){
        console.error('Error fetching menu:', err);
        res.status(500).json({error: 'Failed to retrieve menu data.'});
    }
});

app.get('/api/orders', async (req, res) => {
    const sql = 'SELECT * FROM orders ORDER BY FIELD(order_status, "PENDING", "PREPARING", "COMPLETED"), Field(queue_type, "HARD", "EASY"), order_timestamp DESC';

    try{
        const results = await query(sql);
        res.json(results);
    }catch(err){
        console.log("Error fetching orders:", err)
        res.status(500).json({error: 'Failed to retrieve orders from database.'});
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
});