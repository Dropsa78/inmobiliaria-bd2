//**
//  */ 
//import pkg from "pg";
//const { Pool } = pkg;

//export const pool = new Pool({
  //user: "postgres",
  //host: "localhost",
  //database: "Inmobiliaria-db",
  //password: "Gu7hs2ki1",
  //port: 5432
//});git 

import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});