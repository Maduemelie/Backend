const express = require('express');
const cors = require ('cors')
const userRouter = require('./Routes/authRoutes');
const blogRouter = require('./Routes/blogRoutes');
const connectToDb = require('./config/dbConnect');


require('dotenv').config();
const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.use('/users', userRouter);
app.use('/blogs', blogRouter);

app.get('/', (req, res) => {
  res.json({ message: ' Welcome to my blog' });
});

connectToDb();

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
