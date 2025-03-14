/**
 * Semantic patterns for high-level code compression
 * 
 * This dictionary maps common JavaScript code patterns to their semantic
 * symbol representations. Patterns are organized by category and ordered
 * from most specific to least specific within each category.
 * 
 * Each pattern includes placeholders ($1, $2, etc.) that will be preserved
 * during compression. The patterns focus on high-token-reduction opportunities.
 */

module.exports = {
  //==========================================================================
  // WEB SCRAPING PATTERNS
  //==========================================================================
  
  // Web scraping setup with axios and cheerio (full pattern)
  "const $1 = require('axios');\nconst $2 = require('cheerio');\nconst $3 = require('fs');\nasync function $4($5, $6) {\n  try {\n    const { data } = await $1.get($5);\n    const $ = $2.load(data);\n    const $7 = $($8).text();\n    const $9 = $7.replace(/\\s+/g, ' ').trim();\n    $3.writeFileSync($6, $9);\n    console.log(`Content saved to ${$6}`);\n  } catch ($10) {\n    console.error('Error:', $10.message);\n  }\n}": 
  "웎.웏($4, $5, $6, $7, $8, $9)",
  
  // Web scraping with extraction (no file saving)
  "async function $1($2) {\n  try {\n    const { data } = await axios.get($2);\n    const $ = cheerio.load(data);\n    const $3 = $($4).text();\n    return $3;\n  } catch ($5) {\n    console.error('Error:', $5.message);\n    throw $5;\n  }\n}": 
  "웎.ꪂ($1, $2, $3, $4)",
  
  // Simple GET request with error handling
  "async function $1($2) {\n  try {\n    const response = await axios.get($2);\n    return response.data;\n  } catch ($3) {\n    console.error('Error:', $3.message);\n    throw $3;\n  }\n}": 
  "웃($1, $2, $3)",
  
  // POST request with data and error handling
  "async function $1($2, $3) {\n  try {\n    const response = await axios.post($2, $3);\n    return response.data;\n  } catch ($4) {\n    console.error('Error:', $4.message);\n    throw $4;\n  }\n}": 
  "웋($1, $2, $3, $4)",
  
  //==========================================================================
  // EXPRESS/SERVER PATTERNS
  //==========================================================================
  
  // Express server with middleware and routes setup
  "const express = require('express');\nconst app = express();\nconst PORT = $1 || $2;\n\napp.use(express.json());\napp.use(express.urlencoded({ extended: false }));\n$3\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});": 
  "웒(express, app, $1, $2, $3)",
  
  // Express GET route handler with async/await
  "app.get('$1', async (req, res) => {\n  try {\n    $2\n    return res.status(200).json($3);\n  } catch (error) {\n    console.error('$4:', error.message);\n    return res.status(500).json({ error: '$5' });\n  }\n});": 
  "웓.웃(app, '$1', $2, $3, '$4', '$5')",
  
  // Express POST route handler with body extraction
  "app.post('$1', async (req, res) => {\n  try {\n    const { $2 } = req.body;\n    $3\n    return res.status(201).json($4);\n  } catch (error) {\n    console.error('$5:', error.message);\n    return res.status(500).json({ error: '$6' });\n  }\n});": 
  "웓.웋(app, '$1', $2, $3, $4, '$5', '$6')",
  
  // Express middleware function
  "function $1(req, res, next) {\n  $2\n  next();\n}": 
  "웓.中($1, $2)",
  
  //==========================================================================
  // DATABASE PATTERNS
  //==========================================================================
  
  // MongoDB connection with error handling
  "mongoose.connect('$1', {\n  useNewUrlParser: true,\n  useUnifiedTopology: true$2\n})\n.then(() => console.log('$3'))\n.catch(err => console.error('$4:', err));": 
  "Ⴞ(mongoose, '$1', $2, '$3', '$4')",

  // MongoDB schema and model definition
  "const $1Schema = new mongoose.Schema({\n  $2: {\n    type: $3,\n    required: $4$5\n  },\n  $6: {\n    type: $7,\n    default: $8$9\n  }$10\n});\n\nconst $11 = mongoose.model('$12', $1Schema);": 
  "Ⴠ.Ⴡ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, '$12')",
  
  // Database find operation with sorting and projection
  "async function $1($2) {\n  try {\n    const $3 = await $4.find($2)$5;\n    return $3;\n  } catch (error) {\n    console.error('$6:', error.message);\n    throw error;\n  }\n}": 
  "Ⴚ($1, $2, $3, $4, $5, '$6')",
  
  // Database create operation
  "async function $1($2) {\n  try {\n    const $3 = new $4($2);\n    await $3.save();\n    return $3;\n  } catch (error) {\n    console.error('$5:', error.message);\n    throw error;\n  }\n}": 
  "Ⴛ($1, $2, $3, $4, '$5')",
  
  //==========================================================================
  // DATA TRANSFORMATION PATTERNS
  //==========================================================================
  
  // Map transformation with detailed logic
  "function $1($2) {\n  return $2.map($3 => {\n    $4\n    return $5;\n  });\n}": 
  "༽($1, $2, $3, $4, $5)",
  
  // Filter operation with predicate function
  "function $1($2, $3) {\n  return $2.filter($4 => {\n    $5\n    return $6;\n  });\n}": 
  "༻($1, $2, $3, $4, $5, $6)",
  
  // Reduce operation with accumulator
  "function $1($2, $3) {\n  return $2.reduce(($4, $5) => {\n    $6\n    return $7;\n  }, $3);\n}": 
  "༼($1, $2, $3, $4, $5, $6, $7)",
  
  // Data cleaning and normalization
  "function $1($2) {\n  return $2\n    .filter(item => item !== null && item !== undefined)\n    .map(item => {\n      $3\n      return $4;\n    });\n}": 
  "༿($1, $2, $3, $4)",
  
  //==========================================================================
  // ERROR HANDLING PATTERNS
  //==========================================================================
  
  // Async function with try-catch wrapper
  "async function $1($2) {\n  try {\n    $3\n    return $4;\n  } catch (error) {\n    console.error('$5:', error.message);\n    $6\n  }\n}": 
  "ᕮ.非($1, $2, $3, $4, '$5', $6)",
  
  // Regular function with try-catch wrapper
  "function $1($2) {\n  try {\n    $3\n    return $4;\n  } catch (error) {\n    console.error('$5:', error.message);\n    $6\n  }\n}": 
  "ᕮ($1, $2, $3, $4, '$5', $6)",
  
  // Input validation with error throwing
  "function $1($2) {\n  if (!$2) {\n    throw new Error('$3');\n  }\n  if (typeof $2 !== '$4') {\n    throw new Error('$5');\n  }\n  $6\n  return $7;\n}": 
  "ᕯ($1, $2, '$3', '$4', '$5', $6, $7)",
  
  //==========================================================================
  // AUTHENTICATION PATTERNS
  //==========================================================================
  
  // JWT verification middleware
  "function $1(req, res, next) {\n  const token = req.header('$2');\n  if (!token) {\n    return res.status(401).json({ msg: '$3' });\n  }\n  try {\n    const decoded = jwt.verify(token, '$4');\n    req.$5 = decoded.$5;\n    next();\n  } catch (err) {\n    res.status(401).json({ msg: '$6' });\n  }\n}": 
  "월($1, '$2', '$3', '$4', $5, '$6')",
  
  // Login with JWT generation
  "async function $1(req, res) {\n  const { $2, $3 } = req.body;\n  try {\n    let $4 = await $5.findOne({ $2 });\n    if (!$4) {\n      return res.status(400).json({ msg: '$6' });\n    }\n    const isMatch = await bcrypt.compare($3, $4.$3);\n    if (!isMatch) {\n      return res.status(400).json({ msg: '$7' });\n    }\n    const payload = {\n      $8: $4.id\n    };\n    jwt.sign(payload, '$9', { expiresIn: $10 }, (err, token) => {\n      if (err) throw err;\n      res.json({ token });\n    });\n  } catch (err) {\n    console.error('$11:', err.message);\n    res.status(500).send('$12');\n  }\n}": 
  "ꮚ($1, $2, $3, $4, $5, '$6', '$7', $8, '$9', $10, '$11', '$12')",
  
  //==========================================================================
  // FILE OPERATION PATTERNS
  //==========================================================================
  
  // File read with error handling
  "function $1($2) {\n  try {\n    const data = fs.readFileSync($2, '$3');\n    return data;\n  } catch (error) {\n    console.error('$4:', error.message);\n    $5\n  }\n}": 
  "ꙮ($1, $2, '$3', '$4', $5)",
  
  // File write with error handling
  "function $1($2, $3) {\n  try {\n    fs.writeFileSync($2, $3);\n    console.log(`$4 ${$2}`);\n    return true;\n  } catch (error) {\n    console.error('$5:', error.message);\n    return false;\n  }\n}": 
  "웏($1, $2, $3, '$4', '$5')"
};