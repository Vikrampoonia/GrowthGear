#deployment link:


#Set up instruction
1. download node from https://nodejs.org/en/download
2. make clone using this git clone https://github.com/Vikrampoonia/GrowthGear.git
3. run npm i for install all dependency
4. run npm run dev in terminal and server start to running

#Folder Structure
app.js //main file
/controllers/controller.js   // for logic computation
/dataBase/mockDB.js   // for dataBase in JSON file
/dataBase/queryConvert.js   //for conversion of nlp to sql
/middlewares/auth.js   //for authentication
package.json
package-lock.json


#MockDB
Table name are:
1: users 2: orders 3: products

Column name in users table:
1: id(INT) 2: name(VARCHAR) 3: email(VARCHAR) 4: spending(INT) 5:created_At(Date)
Column name in orders table:
1: id(INT) 2: user_id(INT) 3: status(VARCHAR) 4: amount(INT) 5:date(Date)

Column name in products table:
1: id(INT) 2: name(VARCHAR) 3: category(VARCHAR) 4: price(INT) 

#Query endpoints
1)/query:
method:GET
json data: {"query":"Write your query here"}
Controller:queryController
How it compute:
a) it send to queryFeasibilityController that validate query 
b) if query valid then send to processUserQuery function. It help to convert simple nlp query to sql query
c) last executeQuery function call and it take sql query as parameter and returning data from mockDB data

response sent in json format:
{
"query": input query,
        "sqlQuery": converted sql query ,
        "feasibility": result in feasibility,
        "data": result fetch from mockDB, 
        "error": null or any error
}


2)/explain:
method:GET
json data:{"query":"Write your query here"}
Controller:queryBreakDownController
How it compute:
predefined steps already mention in array

response sent in json format:
{"query": query, //user query 
"breakdown": steps //predefined array of steps
}

3)/validate
method:GET
json data:{"query":"Write your query here"}
Controller:queryFeasibilityController
how it compute:
it help processUserQuery function to check that query can be converted to sql or not

response sent in json format:
{
valid: true/false  //if can be convert to sql
sql:sqlQuery
message: "query convert or not"
}

#query examples
1) show all users
2) show all products
