# GrowthGear - Mini Data Query Simulation Engine

## 🚀 Deployment Link
_(Add your deployment link here)_

---

## 📌 Setup Instructions

1. **Install Node.js** from [Node.js Official Website](https://nodejs.org/en/download).
2. **Clone the repository:**
   ```sh
   git clone https://github.com/Vikrampoonia/GrowthGear.git
   ```
3. **Navigate into the project directory:**
   ```sh
   cd GrowthGear
   ```
4. **Install dependencies:**
   ```sh
   npm install
   ```
5. **Start the server:**
   ```sh
   npm run dev
   ```
   The server will start running on `http://localhost:PORT`.

---

## 📂 Folder Structure
```
GrowthGear/
│── app.js                     # Main entry point
│── package.json                # Project dependencies
│── package-lock.json           # Lock file
│
├── controllers/
│   ├── controller.js           # Handles query logic
│
├── dataBase/
│   ├── mockDB.js               # JSON-based database
│   ├── queryConvert.js         # Converts NLP to SQL
│
├── middlewares/
│   ├── auth.js                 # Authentication middleware
```

---

## 📦 MockDB Structure
This project uses a JSON-based database (`mockDB.js`) with the following tables:

### 🟢 Users Table
| Column Name  | Data Type  |
|-------------|-----------|
| `id`        | INT       |
| `name`      | VARCHAR   |
| `email`     | VARCHAR   |
| `spending`  | INT       |
| `created_At` | DATE      |

### 🟠 Orders Table
| Column Name | Data Type  |
|------------|-----------|
| `id`       | INT       |
| `user_id`  | INT       |
| `status`   | VARCHAR   |
| `amount`   | INT       |
| `date`     | DATE      |

### 🔵 Products Table
| Column Name | Data Type  |
|------------|-----------|
| `id`       | INT       |
| `name`     | VARCHAR   |
| `category` | VARCHAR   |
| `price`    | INT       |

---

## 📡 API Endpoints

### **1️⃣ `/query` - Process Natural Language Query**
- **Method:** `GET`
- **Request Body (JSON):**
  ```json
  { "query": "Write your query here" }
  ```
- **Controller:** `queryController`
- **How it Works:**
  1. `queryFeasibilityController` checks if the query is valid.
  2. If valid, `processUserQuery` converts it to an SQL query.
  3. `executeQuery` fetches data from `mockDB.js`.

- **Response Format:**
  ```json
  {
    "query": "show all users",
    "sqlQuery": "SELECT * FROM users",
    "feasibility": true,
    "data": [...],
    "error": null
  }
  ```

---

### **2️⃣ `/explain` - Query Breakdown**
- **Method:** `GET`
- **Request Body (JSON):**
  ```json
  { "query": "Write your query here" }
  ```
- **Controller:** `queryBreakDownController`
- **Response Format:**
  ```json
  {
    "query": "show all users",
    "breakdown": ["Step 1: Identify table", "Step 2: Fetch data", "Step 3: Return response"]
  }
  ```

---

### **3️⃣ `/validate` - Check Query Feasibility**
- **Method:** `GET`
- **Request Body (JSON):**
  ```json
  { "query": "Write your query here" }
  ```
- **Controller:** `queryFeasibilityController`
- **Response Format:**
  ```json
  {
    "valid": true,
    "sql": "SELECT * FROM users",
    "message": "Query can be converted to SQL"
  }
  ```

---

## 📝 Example Queries
- **"show all users"** → `SELECT * FROM users`
- **"show all products"** → `SELECT * FROM products`
- **"Get orders where amount > 500"** → `SELECT * FROM orders WHERE amount > 500`

---


