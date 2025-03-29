import executeQuery from '../data/mockDB.js';
import {processUserQuery,getQueryCategory,getTableColumnName,getTableName} from '../data/queryConvert.js';



export const queryController = async (req, res) => 
{
    const { query } = req.body;
    if (!query) 
        return res.status(400).json({ error: "Query required" });

    // Create a mock request and response object to call queryFeasibilityController
    const mockReq = { body: { query } };
    let feasibilityResult = null;
    
    const mockRes = 
    {
        json: (data) => {
            feasibilityResult = data;
        },
        status: (code) => {
            return {
                json: (data) => {
                    feasibilityResult = { ...data, statusCode: code };
                }
            };
        }
    };

    // Call the queryFeasibilityController
    await queryFeasibilityController(mockReq, mockRes);
    
    
    if (feasibilityResult && !feasibilityResult.valid) 
        return res.json({
            "query": query,
            "feasibility": feasibilityResult,
            "error": "Query validation failed"
        });
    

    // If the query is valid, proceed with normal processing
    const sql = processUserQuery(query);
    const queryResult = executeQuery(sql);
    
    return res.json({
        "query": query,
        "sqlQuery": sql,
        "feasibility": feasibilityResult,
        "data": queryResult.success ? queryResult.results : [], 
        "error": queryResult.success ? null : queryResult.error
    });
}

export const queryBreakDownController=async(req,res)=>
{
    const { query } = req.body;
    if (!query) 
        return res.status(400).json({ error: "Query required" });

    const steps=[
          "Tokenizing query",
          "Identifying query type",
          "Generating pseudo-SQL",
          "Estimating query complexity"
        ]

    return res.json({"query": query, "breakdown": steps});
}

export const queryFeasibilityController=async(req,res)=>
{
    try 
    {
      const { query } = req.body;
      
      
    if (!query) 
    {
        return res.status(400).json({
          valid: false,
          message: "Query is required"
        });
    }
      
    // First pass: Try to parse the query and identify tokens
    const tokens = query.toLowerCase().split(/\s+/);
    const columns = ["id", "name", "spending", "amount", "user", "date", "category", "price"];
    const tables = ["users", "orders", "products"];
    
    // Initialize token categories to track what we found
    const tokenSymbol = 
    {
      "column": [],
      "table": [],
      "symbol": [],
      "queryType": [],
      "value": []
    };
    
    // Parse the tokens
    let hasValidElements = false;
    
    for (let token of tokens) 
    {
        // Check for columns
        if (getTableColumnName(token, columns)) 
        {
            hasValidElements = true;
            break;
        }
      
        // Check for tables
        if (getTableName(token, tables)) 
        {
          hasValidElements = true;
          break;
        }
      
      // Check for query types
        if (getQueryCategory(token)) 
        {
            hasValidElements = true;
            break;
        }
    }
    
    // Second pass: Try to actually generate SQL
    try 
    {
      const sqlQuery = processUserQuery(query);
      
      // If we got here without errors and generated something
        if (sqlQuery && sqlQuery.includes("SELECT")) 
        {
            return res.json({
              valid: true,
              message: "Query is valid and can be converted to SQL",
              sql: sqlQuery
            });
      } 
      else 
      {
            return res.json({
              valid: false,
              message: "Query structure is invalid or incomplete",
              reason: "Could not generate proper SQL statement"
            });
      }
    } 
    catch (error) 
    {
      return res.json({
        valid: false,
        message: "Query could not be converted to SQL",
        reason: error.message
      });
    }
    
    // If we can't find any valid elements
    if (!hasValidElements) {
      return res.json({
        valid: false,
        message: "Query lacks required elements",
        reason: "No recognizable table names, column names, or query operations found"
      });
    }
    
    }
    catch (error) 
    {
        console.error("Validation error:", error);
        res.status(500).json({
          valid: false,
          message: "Server error during validation",
          error: error.message
        });
    }

}
        



