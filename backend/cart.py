from pydantic import BaseModel
from fastapi import APIRouter,Depends
from user_auth import decode_verify_token
from database import get_connection

cart_router=APIRouter()


class Add_to_cart(BaseModel):
    pdt_id:int
    quantity:int

@cart_router.post("/add_cart")
def add_to_cart(cart_data:Add_to_cart,current_user:dict=Depends(decode_verify_token)):
    user_id=current_user["userId"]
    pdt_id=cart_data.pdt_id
    quantity=cart_data.quantity
    connection=get_connection()
    cursor=connection.cursor()
    cursor.execute("SELECT * FROM products WHERE id=%s",(pdt_id,))
    pdt_row=cursor.fetchone()
    if pdt_row is None:
        return "failed to get product"
    else:
        pdt_qnty=pdt_row[3]
        if quantity>0 and quantity<=pdt_qnty:
            cursor.execute("SELECT quantity FROM cart WHERE user_id=%s AND pdt_id=%s",(user_id,pdt_id))
            quantity_row=cursor.fetchone()
            if quantity_row is not None:
                old_quantity=quantity_row[0]
                new_quantity=quantity+old_quantity
                if new_quantity<=pdt_qnty:
                    cursor.execute("UPDATE cart SET quantity=%s WHERE user_id=%s AND pdt_id=%s",(new_quantity,user_id,pdt_id))
                    connection.commit()
                    connection.close()
                    return {"message":"cart quantity updated"}
                else:
                    return {"message":"total quantity exceeds available stock"}
            else:
                cursor.execute("INSERT INTO cart (user_id,pdt_id,quantity) VALUES(%s,%s,%s)",(user_id,pdt_id,quantity))
                connection.commit()
                connection.close()
            return {"message":"added to cart"}
        else:
            return {"message":"invalid quantity/insuffient stock"}

@cart_router.get("/view_cart")
def view_cart(current_user: dict = Depends(decode_verify_token)):

    connection = get_connection()
    cursor = connection.cursor()

    user_id = current_user["userId"]

    cursor.execute("""
        SELECT
            cart.id,
            products.name,
            products.category,
            products.price,
            cart.quantity,
            products.image
        FROM products
        JOIN cart ON products.id = cart.pdt_id
        WHERE cart.user_id = %s
    """, (user_id,))

    user_cart_row = cursor.fetchall()

    connection.close()

    return {"cart": user_cart_row}

@cart_router.delete("/delete_cart/{cart_id}")
def delete_cart(cart_id:int,current_user:dict=Depends(decode_verify_token)):
    user_id=current_user["userId"]
    connection=get_connection()
    cursor=connection.cursor()
    cursor.execute("DELETE FROM cart WHERE user_id=%s AND id=%s",(user_id,cart_id))
    if cursor.rowcount==0:
        connection.close()
        return {"message": "cart item not found"}
    connection.commit()
    connection.close()
    return {"message":"item deleted"}

