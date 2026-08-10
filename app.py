from fastapi import FastAPI,Depends,HTTPException
from pydantic import BaseModel
from user_auth import router,decode_verify_token
from cart import cart_router
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection

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


class Insert_data(BaseModel):
    name:str
    category:str
    quantity:int
    price:int

@app.post("/products/")
def add_product(product_data:Insert_data,current_user:dict=Depends(decode_verify_token)):
        user_role=current_user["userRole"]
        if user_role=="admin":
             connection=get_connection()
             cursor=connection.cursor()
             name=product_data.name
             category=product_data.category
             quantity=product_data.quantity
             price=product_data.price
             new_data=(name,category,quantity,price)
             cursor.execute("INSERT INTO products(name,category,quantity,price) VALUES(%s,%s,%s,%s)",new_data)
             connection.commit()
             connection.close()
             return {"message":"added"}
        else:
             raise HTTPException(
                  status_code=403,
                  detail="admin access required"
             )
                     
        

@app.get("/view_products")
def view_products(current_user:dict=Depends(decode_verify_token)):
     connection=get_connection()
     cursor=connection.cursor()
     query="""SELECT * FROM products"""
     cursor.execute(query)   
     data=cursor.fetchall()
     return {"data":data}


class Update_item(BaseModel):
     quantity:int | None=None
     price:int | None=None
@app.patch("/update_product/{item_id}")
def update_item(product_data:Update_item,item_id:int,current_user:dict=Depends(decode_verify_token)):
     user_role=current_user["userRole"]
     if user_role=="admin":
          connection=get_connection()
          cursor=connection.cursor()
          if product_data.quantity is not None or product_data.quantity !=0:
               cursor.execute("UPDATE products SET quantity=%s WHERE id=%s",(product_data.quantity,item_id))
          if product_data.price is not None or product_data.price!=0:
               cursor.execute("UPDATE products SET price=%s WHERE id=%s",(product_data.price,item_id))
          connection.commit()
          connection.close()
          return {"message":"updated"}
     else:
          raise HTTPException(
               status_code=403,
               detail="admin access required"
          )

     
@app.delete("/delete_product/{item_id}")
def delete_product(item_id:int,current_user:dict=Depends(decode_verify_token)):
     user_role=current_user["userRole"]
     if user_role=="admin":
          connection=get_connection()
          cursor=connection.cursor()
          cursor.execute("DELETE FROM products WHERE id=%s",(item_id,))
          connection.commit()
          cursor.execute("SELECT * FROM products")
          data=cursor.fetchall()
          output=[]
          for i in data:
               output.append(i)
               connection.close()
               return {"message":"deleted","Data":output}
     else:
          raise HTTPException(
               status_code=403,
               detail="admin access required"
          )



