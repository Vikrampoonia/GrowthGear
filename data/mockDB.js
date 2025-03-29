// Mock database for testing
const mockDB = {
    // Sample data tables
    users: [
      { id: 1, name: "John Doe", email: "john@example.com", spending: 1200, created_at: "2023-01-15" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", spending: 850, created_at: "2023-02-20" },
      { id: 3, name: "Bob Johnson", email: "bob@example.com", spending: 1500, created_at: "2023-01-10" },
      { id: 4, name: "Alice Brown", email: "alice@example.com", spending: 2100, created_at: "2023-03-05" },
      { id: 5, name: "Charlie Davis", email: "charlie@example.com", spending: 750, created_at: "2023-02-28" }
    ],
    
    orders: [
      { id: 101, user_id: 1, amount: 200, date: "2023-03-10", status: "completed" },
      { id: 102, user_id: 3, amount: 350, date: "2023-03-12", status: "completed" },
      { id: 103, user_id: 2, amount: 120, date: "2023-03-15", status: "processing" },
      { id: 104, user_id: 1, amount: 180, date: "2023-03-18", status: "completed" },
      { id: 105, user_id: 4, amount: 450, date: "2023-03-20", status: "processing" },
      { id: 106, user_id: 5, amount: 220, date: "2023-03-22", status: "pending" },
      { id: 107, user_id: 3, amount: 300, date: "2023-03-25", status: "completed" }
    ],
    
    products: [
      { id: 201, name: "Laptop", category: "electronics", price: 899 },
      { id: 202, name: "Smartphone", category: "electronics", price: 699 },
      { id: 203, name: "Headphones", category: "accessories", price: 149 },
      { id: 204, name: "Coffee Maker", category: "home", price: 89 },
      { id: 205, name: "Running Shoes", category: "clothing", price: 129 }
    ]
  };
  
  // Mock database query executor
  export default function executeQuery(sqlQuery) {
    try {
      // This is a very basic SQL parser for demonstration
      // In a real implementation, you would use a proper SQL parser
      const sqlLower = sqlQuery.toLowerCase();
      
      // Determine which table to query
      let targetTable = null;
      for (const table of Object.keys(mockDB)) {
        if (sqlLower.includes(` ${table}`)) {
          targetTable = table;
          break;
        }
      }
      
      if (!targetTable) {
        throw new Error("Unknown table or missing FROM clause");
      }
      
      // Get the data
      let results = [...mockDB[targetTable]];
      
      // Handle WHERE clause (very basic implementation)
      if (sqlLower.includes("where")) {
        const whereClause = sqlLower.split("where")[1].split(/order by|limit|group by/i)[0].trim();
        
        // Parse conditions (extremely simplified)
        if (whereClause.includes(">")) {
          const [field, value] = whereClause.split(">").map(s => s.trim());
          const fieldName = field.split(".").pop(); // Handle table.field format
          const numValue = parseFloat(value);
          
          results = results.filter(row => row[fieldName] > numValue);
        } else if (whereClause.includes("<")) {
          const [field, value] = whereClause.split("<").map(s => s.trim());
          const fieldName = field.split(".").pop();
          const numValue = parseFloat(value);
          
          results = results.filter(row => row[fieldName] < numValue);
        } else if (whereClause.includes("=")) {
          const [field, value] = whereClause.split("=").map(s => s.trim());
          const fieldName = field.split(".").pop();
          const cleanValue = value.replace(/'/g, "").replace(/"/g, "");
          
          results = results.filter(row => String(row[fieldName]) === cleanValue);
        }
      }
      
      // Handle LIMIT clause (basic implementation)
      if (sqlLower.includes("limit")) {
        const limitValue = parseInt(sqlLower.split("limit")[1].trim());
        results = results.slice(0, limitValue);
      }
      
      return {
        success: true,
        results: results,
        affectedRows: results.length,
        sql: sqlQuery
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        sql: sqlQuery
      };
    }
  }
  
  