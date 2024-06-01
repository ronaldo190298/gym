import express, { Request, Response } from 'express';
import { Client } from 'pg';

const app = express();
const port = 3000;

async function getConnection() {
  const client = new Client({
    connectionString: 'postgres://postgres.nhladhcawqbnfkdblwrk:Dhoni@123Naresh@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();
  return client;
}

app.use(express.json());

app.get('/members', async (req: Request, res: Response) => {
  const client = await getConnection();
  try {
    const result = await client.query('SELECT * FROM public."Member" order by id asc');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});

app.post('/members', async (req: Request, res: Response) => {
  const { name, address, phone, date } = req.body;
  const client = await getConnection();
  try {
    const result = await client.query(
      'INSERT INTO public."Member" (name, address, phone, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, address, phone, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});

app.put('/members/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, address, phone, date } = req.body;
  const client = await getConnection();
  try {
    const result = await client.query(
      'UPDATE public."Member" SET name = $1, address = $2, phone = $3, date = $4 WHERE id = $5 RETURNING *',
      [name, address, phone, date, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Member not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});

app.delete('/members/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = await getConnection();
  try {
    const result = await client.query(
      'DELETE FROM public."Member" WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Member not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});



app.get('/payments', async (req: Request, res: Response) => {
  const client = await getConnection();
  try {
    const result = await client.query('SELECT * FROM public."Payment" ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});



app.post('/payments', async (req: Request, res: Response) => {
  const { member, amount, month } = req.body;
  const client = await getConnection();
  try {
    const result = await client.query(
      'INSERT INTO public."Payment" (member, amount, month) VALUES ($1, $2, $3) RETURNING *',
      [member, amount, month]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});

app.put('/payments/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { member, amount, month } = req.body;
  const client = await getConnection();
  try {
    const result = await client.query(
      'UPDATE public."Payment" SET member = $1, amount = $2, month = $3 WHERE id = $4 RETURNING *',
      [member, amount, month, id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Payment not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});


app.get('/due', async (req: Request, res: Response) => {
  const client = await getConnection();
  try {
    const result = await client.query(`
      SELECT 
        member, 
        MIN(date) as min_date, 
        SUM(month) as total_months, 
        (MIN(date) + INTERVAL '1 month' * SUM(month)) as calculated_date
      FROM 
        public."Payment"
      GROUP BY 
        member
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.end();
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
