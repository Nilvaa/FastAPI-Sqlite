from fastapi import FastAPI,Depends
import sqlite3
from pydantic import BaseModel
from user_auth import router,decode_verify_token
from cart import cart_router
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()
app.add_middleware(
     CORSMiddleware,
     allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message":"hello"}

app.include_router(router,prefix="/auth")
app.include_router(cart_router)

def create_table():
    connection=sqlite3.connect("inventory.db")
    cursor=connection.cursor()
    table="""
    CREATE TABLE IF NOT EXISTS products(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL, 
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL);
    """
    cursor.execute(table)
    print("table created")
    connection.close()

create_table()

class Insert_data(BaseModel):
    name:str
    category:str
    quantity:int
    price:int

@app.post("/products/")
def add_product(product_data:Insert_data,current_user:dict=Depends(decode_verify_token)):
        connection=sqlite3.connect("inventory.db")
        cursor=connection.cursor()
        name=product_data.name
        category=product_data.category
        quantity=product_data.quantity
        price=product_data.price
        new_data=(name,category,quantity,price)
        cursor.execute("INSERT INTO products(name,category,quantity,price) VALUES(?,?,?,?)",new_data)
        connection.commit()
        connection.close()
        return {"message":"added"}

@app.get("/view_products")
def view_products(current_user:dict=Depends(decode_verify_token)):
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
     quantity:int
@app.put("/update_product/{item_id}")
def update_item(product_data:Update_item,item_id:int,current_user:dict=Depends(decode_verify_token)):
     connection=sqlite3.connect("inventory.db")
     cursor=connection.cursor()
     quantity=product_data.quantity
     data=(quantity,item_id)
     cursor.execute("UPDATE products SET quantity=? WHERE id=?",(data))
     connection.commit()
     cursor.execute("SELECT * FROM products")
     data=cursor.fetchall()
     output=[]
     for i in data:
          output.append(i)
     connection.close()
     return {"message":"updated","Data":output}

     
@app.delete("/delete_product/{item_id}")
def delete_product(item_id:int,current_user:dict=Depends(decode_verify_token)):
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



