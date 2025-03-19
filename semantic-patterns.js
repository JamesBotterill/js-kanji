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
  
  // Complex web scraping with pagination
  "async function $1($2, $3) {\n  const results = [];\n  let page = 1;\n  let hasMorePages = true;\n  \n  while (hasMorePages && page <= $3) {\n    try {\n      const url = `${$2}?page=${page}`;\n      const { data } = await axios.get(url);\n      const $ = cheerio.load(data);\n      \n      const pageItems = $('$4').map((_i, el) => {\n        const $item = $(el);\n        return {\n          $5: $item.find('$6').text().trim(),\n          $7: $item.find('$8').attr('$9')\n        };\n      }).get();\n      \n      results.push(...pageItems);\n      page++;\n      hasMorePages = pageItems.length > 0;\n    } catch (error) {\n      console.error('Scraping error:', error.message);\n      break;\n    }\n  }\n  \n  return results;\n}":
  "웎.页($1, $2, $3, '$4', '$5', '$6', '$7', '$8', '$9')",
  
  // Fetch with async/await and headers
  "async function $1($2, $3) {\n  const options = {\n    method: 'GET',\n    headers: $3\n  };\n  \n  try {\n    const response = await fetch($2, options);\n    if (!response.ok) {\n      throw new Error(`HTTP error: ${response.status}`);\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Fetch error:', error.message);\n    throw error;\n  }\n}":
  "獲函($1, $2, $3)",
  
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
  
  // Express Router definition with multiple routes
  "const express = require('express');\nconst router = express.Router();\n\n$1\n\nmodule.exports = router;":
  "路由($1)",
  
  // Express controller pattern
  "exports.$1 = async (req, res) => {\n  try {\n    $2\n    return res.status($3).json($4);\n  } catch (error) {\n    console.error('$5:', error.message);\n    return res.status(500).json({ error: error.message });\n  }\n}":
  "控($1, $2, $3, $4, '$5')",
  
  // Express error handler middleware
  "function errorHandler(err, req, res, next) {\n  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;\n  res.status(statusCode);\n  res.json({\n    message: err.message,\n    stack: process.env.NODE_ENV === 'production' ? null : err.stack\n  });\n}":
  "捕手()",
  
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
  
  // Database update operation
  "async function $1($2, $3) {\n  try {\n    const $4 = await $5.findByIdAndUpdate($2, $3, { new: true });\n    if (!$4) {\n      throw new Error('$6');\n    }\n    return $4;\n  } catch (error) {\n    console.error('$7:', error.message);\n    throw error;\n  }\n}":
  "㎋($1, $2, $3, $4, $5, '$6', '$7')",
  
  // Database delete operation
  "async function $1($2) {\n  try {\n    const $3 = await $4.findByIdAndDelete($2);\n    if (!$3) {\n      throw new Error('$5');\n    }\n    return $3;\n  } catch (error) {\n    console.error('$6:', error.message);\n    throw error;\n  }\n}":
  "㎌($1, $2, $3, $4, '$5', '$6')",
  
  // SQL query with parameterized query and connection pool
  "async function $1($2) {\n  let connection;\n  try {\n    connection = await pool.getConnection();\n    const [rows] = await connection.execute('$3', $2);\n    return rows;\n  } catch (error) {\n    console.error('$4:', error.message);\n    throw error;\n  } finally {\n    if (connection) connection.release();\n  }\n}":
  "㎐($1, $2, '$3', '$4')",
  
  //==========================================================================
  // REACT/FRONTEND PATTERNS
  //==========================================================================
  
  // React functional component with useState
  "function $1({ $2 }) {\n  const [$3, set$4] = useState($5);\n  \n  $6\n  \n  return (\n    <div className=\"$7\">\n      $8\n    </div>\n  );\n}":
  "⚛($1, $2, $3, $4, $5, $6, '$7', $8)",
  
  // React useEffect hook
  "useEffect(() => {\n  $1\n  \n  return () => {\n    $2\n  };\n}, [$3]);":
  "⚛.⚙($1, $2, $3)",
  
  // React custom hook
  "function use$1($2) {\n  const [$3, set$4] = useState($5);\n  \n  useEffect(() => {\n    $6\n    \n    return () => {\n      $7\n    };\n  }, [$8]);\n  \n  const $9 = useCallback(($10) => {\n    $11\n  }, [$12]);\n  \n  return { $3, $9 };\n}":
  "⚛.◉($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
  
  // React context provider
  "const $1Context = createContext();\n\nexport function $1Provider({ children }) {\n  const [$2, set$3] = useState($4);\n  \n  $5\n  \n  const value = {\n    $2,\n    $6\n  };\n  \n  return (\n    <$1Context.Provider value={value}>\n      {children}\n    </$1Context.Provider>\n  );\n}\n\nexport function use$1() {\n  const context = useContext($1Context);\n  if (context === undefined) {\n    throw new Error('use$1 must be used within a $1Provider');\n  }\n  return context;\n}":
  "⚛.⚪($1, $2, $3, $4, $5, $6)",
  
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
  
  // Complex data transformation pipeline
  "function $1($2) {\n  return $2\n    .filter($3 => $4)\n    .map($5 => {\n      $6\n      return $7;\n    })\n    .reduce(($8, $9) => {\n      $10\n      return $11;\n    }, $12);\n}":
  "⌁($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
  
  // Group by operation
  "function $1($2, $3) {\n  return $2.reduce(($4, $5) => {\n    const key = $5[$3];\n    if (!$4[key]) {\n      $4[key] = [];\n    }\n    $4[key].push($5);\n    return $4;\n  }, {});\n}":
  "⩚($1, $2, $3, $4, $5)",
  
  // Array flattening with depth
  "function $1($2, $3 = 1) {\n  return $3 > 0\n    ? $2.reduce(\n        (acc, val) => acc.concat(\n          Array.isArray(val) \n            ? $1(val, $3 - 1)\n            : val\n        ),\n        []\n      )\n    : $2.slice();\n}":
  "⩛($1, $2, $3)",
  
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
  
  // Custom error class
  "class $1Error extends Error {\n  constructor($2) {\n    super($2);\n    this.name = '$1Error';\n    $3\n  }\n}":
  "ᕲ($1, $2, $3)",
  
  // Async retry logic with exponential backoff
  "async function $1($2, { maxRetries = 3, delay = 1000, factor = 2 } = {}) {\n  let lastError;\n  \n  for (let attempt = 0; attempt < maxRetries; attempt++) {\n    try {\n      return await $2();\n    } catch (error) {\n      console.warn(`Attempt ${attempt + 1}/$3 failed:`, error.message);\n      lastError = error;\n      \n      const timeout = delay * Math.pow(factor, attempt);\n      await new Promise(resolve => setTimeout(resolve, timeout));\n    }\n  }\n  \n  throw lastError;\n}":
  "ᕦ($1, $2, $3)",
  
  //==========================================================================
  // AUTHENTICATION PATTERNS
  //==========================================================================
  
  // JWT verification middleware
  "function $1(req, res, next) {\n  const token = req.header('$2');\n  if (!token) {\n    return res.status(401).json({ msg: '$3' });\n  }\n  try {\n    const decoded = jwt.verify(token, '$4');\n    req.$5 = decoded.$5;\n    next();\n  } catch (err) {\n    res.status(401).json({ msg: '$6' });\n  }\n}": 
  "월($1, '$2', '$3', '$4', $5, '$6')",
  
  // Login with JWT generation
  "async function $1(req, res) {\n  const { $2, $3 } = req.body;\n  try {\n    let $4 = await $5.findOne({ $2 });\n    if (!$4) {\n      return res.status(400).json({ msg: '$6' });\n    }\n    const isMatch = await bcrypt.compare($3, $4.$3);\n    if (!isMatch) {\n      return res.status(400).json({ msg: '$7' });\n    }\n    const payload = {\n      $8: $4.id\n    };\n    jwt.sign(payload, '$9', { expiresIn: $10 }, (err, token) => {\n      if (err) throw err;\n      res.json({ token });\n    });\n  } catch (err) {\n    console.error('$11:', err.message);\n    res.status(500).send('$12');\n  }\n}": 
  "ꮚ($1, $2, $3, $4, $5, '$6', '$7', $8, '$9', $10, '$11', '$12')",
  
  // User registration with password hashing
  "async function $1(req, res) {\n  const { $2, $3, $4 } = req.body;\n\n  try {\n    let user = await $5.findOne({ $3 });\n    if (user) {\n      return res.status(400).json({ msg: '$6' });\n    }\n\n    user = new $5({\n      $2,\n      $3,\n      $4\n    });\n\n    const salt = await bcrypt.genSalt(10);\n    user.$4 = await bcrypt.hash(user.$4, salt);\n\n    await user.save();\n    \n    const payload = {\n      user: {\n        id: user.id\n      }\n    };\n\n    jwt.sign(\n      payload,\n      '$7',\n      { expiresIn: $8 },\n      (err, token) => {\n        if (err) throw err;\n        res.json({ token });\n      }\n    );\n  } catch (err) {\n    console.error('$9:', err.message);\n    res.status(500).send('$10');\n  }\n}":
  "ꮑ($1, $2, $3, $4, $5, '$6', '$7', $8, '$9', '$10')",
  
  // OAuth2 authorization flow
  "function $1(req, res) {\n  const oauth2Client = new OAuth2Client(\n    process.env.$2_CLIENT_ID,\n    process.env.$2_CLIENT_SECRET,\n    '$3'\n  );\n\n  const authUrl = oauth2Client.generateAuthUrl({\n    access_type: 'offline',\n    scope: ['$4', '$5'],\n    prompt: 'consent'\n  });\n\n  res.redirect(authUrl);\n}":
  "ꮀ($1, $2, '$3', '$4', '$5')",
  
  //==========================================================================
  // FILE OPERATION PATTERNS
  //==========================================================================
  
  // File read with error handling
  "function $1($2) {\n  try {\n    const data = fs.readFileSync($2, '$3');\n    return data;\n  } catch (error) {\n    console.error('$4:', error.message);\n    $5\n  }\n}": 
  "ꙮ($1, $2, '$3', '$4', $5)",
  
  // File write with error handling
  "function $1($2, $3) {\n  try {\n    fs.writeFileSync($2, $3);\n    console.log(`$4 ${$2}`);\n    return true;\n  } catch (error) {\n    console.error('$5:', error.message);\n    return false;\n  }\n}": 
  "웏($1, $2, $3, '$4', '$5')",
  
  // Recursive directory traversal
  "function $1($2) {\n  const results = [];\n  \n  function traverse(dir) {\n    const files = fs.readdirSync(dir);\n    \n    for (const file of files) {\n      const filePath = path.join(dir, file);\n      const stat = fs.statSync(filePath);\n      \n      if (stat.isDirectory()) {\n        traverse(filePath);\n      } else if ($3(file)) {\n        results.push(filePath);\n      }\n    }\n  }\n  \n  traverse($2);\n  return results;\n}":
  "꙰($1, $2, $3)",
  
  // Stream-based file processing
  "function $1($2, $3) {\n  return new Promise((resolve, reject) => {\n    const readStream = fs.createReadStream($2);\n    const writeStream = fs.createWriteStream($3);\n    \n    readStream.on('error', reject);\n    writeStream.on('error', reject);\n    writeStream.on('finish', resolve);\n    \n    readStream\n      .pipe($4)\n      .pipe(writeStream);\n  });\n}":
  "ꚛ($1, $2, $3, $4)",
  
  //==========================================================================
  // TESTING PATTERNS
  //==========================================================================
  
  // Jest test suite
  "describe('$1', () => {\n  beforeEach(() => {\n    $2\n  });\n  \n  afterEach(() => {\n    $3\n  });\n  \n  test('$4', () => {\n    $5\n    expect($6).$7($8);\n  });\n  \n  test('$9', () => {\n    $10\n    expect($11).$12($13);\n  });\n});":
  "🧪($1, $2, $3, '$4', $5, $6, $7, $8, '$9', $10, $11, $12, $13)",
  
  // Mocha test suite
  "describe('$1', function() {\n  before(function() {\n    $2\n  });\n  \n  after(function() {\n    $3\n  });\n  \n  it('$4', function() {\n    $5\n  });\n  \n  it('$6', function() {\n    $7\n  });\n});":
  "📋($1, $2, $3, '$4', $5, '$6', $7)",
  
  // Test mock function
  "jest.mock('$1', () => ({\n  $2: jest.fn().mockImplementation(($3) => {\n    $4\n    return $5;\n  }),\n  $6: jest.fn().mockResolvedValue($7)\n}));":
  "🔍($1, $2, $3, $4, $5, $6, $7)",
  
  //==========================================================================
  // UTILITY PATTERNS
  //==========================================================================
  
  // Debounce function
  "function debounce(func, wait) {\n  let timeout;\n  return function(...args) {\n    const context = this;\n    clearTimeout(timeout);\n    timeout = setTimeout(() => {\n      func.apply(context, args);\n    }, wait);\n  };\n}":
  "⏱()",
  
  // Throttle function
  "function throttle(func, limit) {\n  let inThrottle;\n  return function(...args) {\n    const context = this;\n    if (!inThrottle) {\n      func.apply(context, args);\n      inThrottle = true;\n      setTimeout(() => inThrottle = false, limit);\n    }\n  };\n}":
  "⏲()",
  
  // Deep object clone
  "function deepClone(obj) {\n  if (obj === null || typeof obj !== 'object') {\n    return obj;\n  }\n  \n  if (Array.isArray(obj)) {\n    return obj.map(item => deepClone(item));\n  }\n  \n  const cloned = {};\n  for (const key in obj) {\n    if (Object.prototype.hasOwnProperty.call(obj, key)) {\n      cloned[key] = deepClone(obj[key]);\n    }\n  }\n  \n  return cloned;\n}":
  "📋()",
  
  // UUID generation
  "function generateUUID() {\n  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {\n    const r = Math.random() * 16 | 0;\n    const v = c === 'x' ? r : (r & 0x3 | 0x8);\n    return v.toString(16);\n  });\n}":
  "🆔()"
};