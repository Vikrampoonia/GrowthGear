// Find query category
function getQueryCategory(token) 
{
    const categoryRules = [
        { type: 'aggregate', keywords: ['total', 'average', 'avg', 'sum', 'count', 'min', 'max'] },
        { type: 'filter', keywords: ['where', 'filter', 'only', 'and', 'or', 'between'] },
        { type: 'order', keywords: ['sort', 'order', 'ascending', 'descending'] },
        { type: 'limit', keywords: ['limit', 'top', 'first', 'last'] }
    ];

    for (const rule of categoryRules) 
    {
        if (rule.keywords.includes(token.toLowerCase())) 
            return rule.type;

    }

    return false;
}

// Find table column
function getTableColumnName(token, columns) 
{
    if (token.toLowerCase() === "all") 
        return "all";
    
    if (columns.includes(token.toLowerCase())) 
        return token.toLowerCase();

    return false;
}

//get table name
function getTableName(token, tables) 
{
    if (tables.includes(token.toLowerCase())) 
        return token.toLowerCase();
    

    return false;
}

//get sql symbol against the token
function getQuerySymbol(token) 
{
    const symbolRules = [
        { symbol: '*', keywords: ['all'] },
        { symbol: '>', keywords: ['more', 'greater', 'above', 'over'] },
        { symbol: '<', keywords: ['less', 'under', 'below'] },
        { symbol: '=', keywords: ['equal', 'equals', 'is'] },
        { symbol: 'AND', keywords: ['and', 'also', 'plus'] },
        { symbol: 'OR', keywords: ['or', 'either'] },
        { symbol: 'BETWEEN', keywords: ['between', 'range', 'from'] },
        { symbol: 'LIKE', keywords: ['like', 'contains', 'similar'] },
        { symbol: 'IN', keywords: ['in', 'within'] },
        { symbol: 'ORDER BY', keywords: ['sort', 'order'] },
        { symbol: 'ASC', keywords: ['ascending', 'increasing'] },
        { symbol: 'DESC', keywords: ['descending', 'decreasing'] },
        { symbol: 'LIMIT', keywords: ['limit', 'top', 'first'] }
    ];

    for (const rule of symbolRules) 
    {
        if (rule.keywords.includes(token.toLowerCase())) 
            return rule.symbol;
        
    }
    
    return false;
}

//token is number or not
function isNumber(token) 
{
    return !isNaN(parseFloat(token)) && isFinite(token);
}

function convertToSQL(query) 
{
    // Step 1: Convert this query into tokens
    const tokens = query.toLowerCase().split(/\s+/);
    
    // Define database schema
    const columns = ["id", "name", "spending", "amount", "user", "date", "category", "price"];
    const tables = ["users", "orders", "products"];
    
    // Initialize token categories
    const tokenSymbol = {
        "column": [],
        "table": [],
        "symbol": [],
        "queryType": [],
        "value": [],
        "aggregate": [],
        "orderDirection": null,
        "limit": null
    };

    // Parse the natural language query
    for (let i = 0; i < tokens.length; i++) 
    {
        let token = tokens[i];
        
        // Check if token is a number or value
        if (isNumber(token)) {
            tokenSymbol["value"].push(token);
            continue;
        }
        
        // Get column name
        const columnName = getTableColumnName(token, columns);
        if (columnName) {
            if (columnName === "all") {
                tokenSymbol["column"].push("*");
            } else {
                tokenSymbol["column"].push(columnName);
            }
        }
        
        // Get table name
        const tableName = getTableName(token, tables);
        if (tableName) {
            tokenSymbol["table"].push(tableName);
        }
        
        // Get query symbol
        const symbol = getQuerySymbol(token);
        if (symbol) 
        {
            tokenSymbol["symbol"].push(symbol);
            
            // Special handling for ORDER BY direction
            if (symbol === 'ASC' || symbol === 'DESC') 
                tokenSymbol["orderDirection"] = symbol;
            
            
            // Special handling for LIMIT
            if (symbol === 'LIMIT' && i + 1 < tokens.length && isNumber(tokens[i + 1])) 
                tokenSymbol["limit"] = tokens[i + 1];
            
        }
        
        // Get query category
        const category = getQueryCategory(token);
        if (category) 
        {
            tokenSymbol["queryType"].push(category);
            
            // Handle aggregate functions
            if (category === 'aggregate') 
            {
                // Map natural language to SQL aggregate functions
                const aggregateMap = {
                    'total': 'SUM',
                    'sum': 'SUM',
                    'average': 'AVG',
                    'avg': 'AVG',
                    'count': 'COUNT',
                    'min': 'MIN',
                    'max': 'MAX'
                };
                
                tokenSymbol["aggregate"].push(aggregateMap[token.toLowerCase()] || token.toUpperCase());
            }
        }
    }
    
    // Step 3: Convert token symbols to SQL query
    let sqlQuery = "";
    
    // Start with SELECT clause
    if (tokenSymbol["aggregate"].length > 0 && tokenSymbol["column"].length > 0) 
    {
        // If we have both aggregate functions and columns
        let selectClause = "SELECT ";
        for (let i = 0; i < tokenSymbol["aggregate"].length; i++) 
        {
            if (i < tokenSymbol["column"].length) 
            {
                selectClause += `${tokenSymbol["aggregate"][i]}(${tokenSymbol["column"][i]})`;
                if (i < tokenSymbol["aggregate"].length - 1) 
                    selectClause += ", ";
            }
        }
        sqlQuery = selectClause;
    } 
    else if (tokenSymbol["column"].includes("*")) 
    {
        // If 'all' columns are requested
        sqlQuery = "SELECT *";
    } 
    else if (tokenSymbol["column"].length > 0) 
    {
        // If specific columns are requested
        sqlQuery = "SELECT " + tokenSymbol["column"].join(", ");
    } 
    else 
    {
        // Default to SELECT *
        sqlQuery = "SELECT *";
    }
    
    // Add FROM clause
    if (tokenSymbol["table"].length > 0) 
    {
        sqlQuery += " FROM " + tokenSymbol["table"][0];
        
        // Handle JOIN if multiple tables (simplified)
        if (tokenSymbol["table"].length > 1) 
        {
            for (let i = 1; i < tokenSymbol["table"].length; i++) 
            {
                sqlQuery += ` JOIN ${tokenSymbol["table"][i]} ON ${tokenSymbol["table"][0]}.id = ${tokenSymbol["table"][i]}.${tokenSymbol["table"][0].slice(0, -1)}_id`;
            }
        }
    } 
    else 
    {
        // Default to first table in the list if none specified
        sqlQuery += " FROM users";
    }
    
    // Add WHERE clause if filter tokens exist
    if (tokenSymbol["queryType"].includes("filter") && tokenSymbol["symbol"].length > 0 && tokenSymbol["column"].length > 0) 
    {
        sqlQuery += " WHERE ";
        
        // Build condition(s)
        let conditions = [];
        let filterColumns = tokenSymbol["column"].filter(col => col !== "*");
        
        // Simple handling for basic conditions
        for (let i = 0; i < Math.min(filterColumns.length, tokenSymbol["symbol"].length, tokenSymbol["value"].length); i++) 
        {
            if (tokenSymbol["symbol"][i] === 'BETWEEN' && i + 1 < tokenSymbol["value"].length) 
            {
                conditions.push(`${filterColumns[i]} BETWEEN ${tokenSymbol["value"][i]} AND ${tokenSymbol["value"][i+1]}`);
                i++; // Skip the next value as we've used it
            } else if (tokenSymbol["symbol"][i] === 'LIKE') 
            {
                conditions.push(`${filterColumns[i]} LIKE '%${tokenSymbol["value"][i]}%'`);
            } 
            else if (tokenSymbol["symbol"][i] === 'IN') 
            {
                // Basic IN handling
                conditions.push(`${filterColumns[i]} IN (${tokenSymbol["value"].join(", ")})`);
            } 
            else 
            {
                conditions.push(`${filterColumns[i]} ${tokenSymbol["symbol"][i]} ${tokenSymbol["value"][i]}`);
            }
        }
        
        // Combine conditions with AND by default
        sqlQuery += conditions.join(" AND ");
    }
    
    // Add ORDER BY clause if ordering is requested
    if (tokenSymbol["queryType"].includes("order") && tokenSymbol["column"].length > 0) 
    {
        const orderColumn = tokenSymbol["column"].filter(col => col !== "*")[0] || "id";
        sqlQuery += ` ORDER BY ${orderColumn}`;
        
        // Add direction if specified
        if (tokenSymbol["orderDirection"]) 
            sqlQuery += ` ${tokenSymbol["orderDirection"]}`;
        
    }
    
    // Add LIMIT clause if specified
    if (tokenSymbol["limit"]) 
        sqlQuery += ` LIMIT ${tokenSymbol["limit"]}`;
    
    console.log("sqlQuery: "+sqlQuery);
    return sqlQuery;
}

function processUserQuery(userInput) 
{
    if (!userInput || userInput.trim() === "") 
        return "Please enter a valid query.";
    
    try 
    {
        const sqlQuery = convertToSQL(userInput);
        return sqlQuery;
    } 
    catch (error) 
    {
        return `Error converting to SQL: ${error.message}`;
    }
}


export {processUserQuery,getQueryCategory,getTableColumnName,getTableName};