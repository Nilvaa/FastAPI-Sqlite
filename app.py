from fastapi import FastAPI
import sqlite3
from pydantic import BaseModel

app=FastAPI()

@app.get("/")
def home():
    return {"message":"hello"}





def create_table():
    connection=sqlite3.connect("inventory.db")
    cursor=connection.cursor()
    table="""
    CREATE TABLE IF NOT EXISTS products(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL, 
    quanitity INTEGER NOT NULL)
    """
    cursor.execute(table)
    print("table created")
    connection.close()

create_table()

class Insert_data(BaseModel):
    name:str
    category:str
    quanitity:int

@app.post("/products/")
def add_product(product_data:Insert_data):
        connection=sqlite3.connect("inventory.db")
        cursor=connection.cursor()
        name=product_data.name
        category=product_data.category
        quanitity=product_data.quanitity
        new_data=(name,category,quanitity)
        cursor.execute("INSERT INTO products(name,category,quanitity) VALUES(?,?,?)",new_data)
        connection.commit()
        connection.close()
        return {"message":"added"}

@app.get("/view_products")
def view_products():
     connection=sqlite3.connect("inventory.db")
     cursor=connection.cursor()
     query="""SELECT * FROM products"""
     cursor.execute(query)   
     data=cursor.fetchall()
     output=[]
     for i in data:
          output.append(i)
     connection.close()
     return {"data":output}


class Update_item(BaseModel):
     quanitity:int
@app.put("/update_product/{item_id}")
def update_item(product_data:Update_item,item_id:int):
     connection=sqlite3.connect("inventory.db")
     cursor=connection.cursor()
     quanitity=product_data.quanitity
     data=(quanitity,item_id)
     cursor.execute("UPDATE products SET quanitity=? WHERE id=?",(data))
     connection.commit()
     cursor.execute("SELECT * FROM products")
     data=cursor.fetchall()
     output=[]
     for i in data:
          output.append(i)
     connection.close()
     return {"message":"updated","Data":output}

     
@app.delete("/delete_product/{item_id}")
def delete_product(item_id:int):
     connection=sqlite3.connect("inventory.db")
     cursor=connection.cursor()
     cursor.execute("DELETE FROM products WHERE id=?",(item_id,))
     connection.commit()
     cursor.execute("SELECT * FROM products")
     data=cursor.fetchall()
     output=[]
     for i in data:
          output.append(i)
     connection.close()
     return {"message":"deleted","Data":output}



