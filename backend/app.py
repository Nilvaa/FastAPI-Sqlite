from fastapi import FastAPI, Depends, HTTPException, Form, UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from user_auth import router, decode_verify_token
from cart import cart_router
from database import get_connection

app=FastAPI()

app.mount("/uploads",StaticFiles(directory="uploads"),name="uploads")
app.add_middleware(
     CORSMiddleware,
     allow_origins=["http://localhost:5173","https://fast-api-sqlite-kx4xc6vus-avlinantony26-9259s-projects.vercel.app"],
     
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
async def add_product(
     name:str=Form(...),
     category:str=Form(...),
     quantity:int=Form(...),
     price:int=Form(...),
     image:UploadFile=File(...),
     current_user:dict=Depends(decode_verify_token)
):
        user_role=current_user["userRole"]
        if user_role!="admin":
             raise HTTPException(
                  status_code=403,
                  detail="admin access required"
             )
        if quantity <=0:
             raise HTTPException(
                  status_code=400,
                  detail="invalid Quantity"
             )
        if price <=0:
            raise HTTPException(
            status_code=400,
            detail="invalid Quantity"
            )        
        allowed_types=["image/jpeg","image/png","image/webp"]

        if image.content_type not in allowed_types:
             raise HTTPException(
                  status_code=400,
                  detail="Only JPG, PNG and WEBP images are allowed"
             )
        #save image
        image_path=f"uploads/{image.filename}"

        with open(image_path,"wb") as buffer:
             buffer.write(await image.read())

        connection=get_connection()
        cursor=connection.cursor()

        cursor.execute(
             """
                INSERT INTO products
                (name,category,quantity,price,image)
                VALUES(%s,%s,%s,%s,%s)
             """,
             (name,category,quantity,price,image.filename)
        )
        connection.commit()
        connection.close()
        return {
             "message":"image uploaded",
             "image":image.filename
        }
@app.get("/view_products")
def view_products(current_user:dict=Depends(decode_verify_token)):
     connection=get_connection()
     cursor=connection.cursor()
     query="""SELECT * FROM products"""
     cursor.execute(query)   
     data=cursor.fetchall()
     return {"data":data}


class Update_item(BaseModel):
    quantity: int | None = None
    price: int | None = None


@app.patch("/update_product/{item_id}")
def update_item(
    product_data: Update_item,
    item_id: int,
    current_user: dict = Depends(decode_verify_token)
):

    user_role = current_user["userRole"]

    # Only admin can update products
    if user_role != "admin":
        raise HTTPException(
            status_code=403,
            detail="admin access required"
        )

    # Validate that at least one field is provided
    if (
        product_data.quantity is None
        and product_data.price is None
    ):
        raise HTTPException(
            status_code=400,
            detail="provide quantity or price"
        )

    # Validate quantity
    if product_data.quantity is not None:
        if product_data.quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail="invalid quantity"
            )

    # Validate price
    if product_data.price is not None:
        if product_data.price <= 0:
            raise HTTPException(
                status_code=400,
                detail="invalid price"
            )

    connection = get_connection()
    cursor = connection.cursor()

    # Update both values
    if (
        product_data.quantity is not None
        and product_data.price is not None
    ):

        cursor.execute(
            """
            UPDATE products
            SET quantity = %s,
                price = %s
            WHERE id = %s
            """,
            (
                product_data.quantity,
                product_data.price,
                item_id
            )
        )

        message = "quantity and price updated"

    # Update only quantity
    elif product_data.quantity is not None:

        cursor.execute(
            """
            UPDATE products
            SET quantity = %s
            WHERE id = %s
            """,
            (
                product_data.quantity,
                item_id
            )
        )

        message = "quantity updated"

    # Update only price
    elif product_data.price is not None:

        cursor.execute(
            """
            UPDATE products
            SET price = %s
            WHERE id = %s
            """,
            (
                product_data.price,
                item_id
            )
        )

        message = "price updated"

    connection.commit()

    cursor.close()
    connection.close()

    return {
        "message": message
    }
          
     
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



