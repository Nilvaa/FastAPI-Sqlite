import sqlite3
from pydantic import BaseModel
from fastapi import APIRouter,Depends
from user_auth import decode_verify_token

cart_router=APIRouter()

def cart_table():
    table="""
    CREATE TABLE IF NOT EXISTS cart(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    pdt_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL);
    """
    connection=sqlite3.connect("inventory.db")
    cursor=connection.cursor()
    cursor.execute(table)
    connection.commit()
    connection.close()

cart_table()

class Add_to_cart(BaseModel):
    pdt_id:int
    quantity:int

@cart_router.post("/add_cart")
def add_to_cart(cart_data:Add_to_cart,current_user:dict=Depends(decode_verify_token)):
    user_id=current_user["userId"]
    pdt_id=cart_data.pdt_id
    quantity=cart_data.quantity
    connection=sqlite3.connect("inventory.db")
    cursor=connection.cursor()
    cursor.execute("SELECT * FROM products WHERE id=?",(pdt_id,))
    pdt_row=cursor.fetchone()
    if pdt_row is None:
        return "failed to get product"
    else:
        pdt_qnty=pdt_row[3]
        if quantity>0 and quantity<=pdt_qnty:
            cursor.execute("SELECT quantity FROM cart WHERE user_id=? AND pdt_id=?",(user_id,pdt_id))
            quantity_row=cursor.fetchone()
            if quantity_row is not None:
                old_quantity=quantity_row[0]
                new_quantity=quantity+old_quantity
                if new_quantity<=pdt_qnty:
                    cursor.execute("UPDATE cart SET quantity=? WHERE user_id=? AND pdt_id=?",(new_quantity,user_id,pdt_id))
                    connection.commit()
                    connection.close()
                    return {"message":"cart quantity updated"}
                else:
                    return {"message":"total quantity exceeds available stock"}
            else:
                cursor.execute("INSERT INTO cart (user_id,pdt_id,quantity) VALUES(?,?,?)",(user_id,pdt_id,quantity))
                connection.commit()
                connection.close()
            return {"message":"added to cart"}
        else:
            return {"message":"invalid quantity/insuffient stock"}

@cart_router.get("/view_cart")
def view_cart(current_user:dict=Depends(decode_verify_token)):
    connection=sqlite3.connect("inventory.db")
    cursor=connection.cursor()
    user_id=current_user["userId"]
    cursor.execute("""
    SELECT cart.id, products.name, products.category,
           products.price, cart.quantity
    FROM products
    JOIN cart ON products.id = cart.pdt_id
    WHERE cart.user_id=?
""", (user_id,))
    user_cart_row=cursor.fetchall()
    connection.close()
    return {"cart":user_cart_row}

@cart_router.delete("/delete_cart/{cart_id}")
def delete_cart(cart_id:int,current_user:dict=Depends(decode_verify_token)):
    user_id=current_user["userId"]
    connection=sqlite3.connect("inventory.db")
    cursor=connection.cursor()
    cursor.execute("DELETE FROM cart WHERE user_id=? AND id=?",(user_id,cart_id))
    if cursor.rowcount==0:
        connection.close()
        return {"message": "cart item not found"}
    connection.commit()
    connection.close()
    return {"message":"item deleted"}

