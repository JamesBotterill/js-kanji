/**
 * Dictionary for compound patterns in JS-Kanji
 * 
 * These are common multi-token patterns in JavaScript that are replaced
 * with compound Kanji sequences. This approach is more efficient than
 * replacing individual tokens.
 */

module.exports = {
  // Express.js patterns
  'app.get(': '応取(',
  'app.post(': '応投(',
  'app.put(': '応置(',
  'app.delete(': '応消(',
  'app.use(': '応用(',
  'app.listen(': '応聴(',
  
  // Console and process patterns
  'console.log(': '示録(',
  'console.error(': '示誤(',
  'process.env.': '過環.',
  
  // Module patterns
  'module.exports': '組送',
  'module.exports.': '組送.',
  
  // Promise patterns
  'new Promise(': '新約(',
  'Promise.resolve(': '約決(',
  'Promise.reject(': '約否(',
  'Promise.all(': '約全(',
  
  // Common control flow patterns
  'try {': '試{',
  'catch (': '捕(',
  'if (': '条(',
  'else {': '他{',
  'else if': '他条',
  'return ': '返 ',
  
  // Method chain patterns
  '.then(': '.続(',
  '.catch(': '.獲(',
  '.forEach(': '.各(',
  '.map(': '.写(',
  '.filter(': '.濾(',
  '.reduce(': '.縮(',
  
  // Function patterns
  'function (': '関(',
  'async function(': '非関(',
  'async (': '非(',
  '() => {': '()矢{',
  '=> {': '矢{',
  
  // Variable declaration patterns
  'const ': '定 ',
  'let ': '変 ',
  'var ': '数 ',
  'await ': '待 ',
  'new ': '新 ',
  
  // Mongoose patterns
  'mongoose.connect(': '獏接(',
  'mongoose.Schema': '獏図',
  'mongoose.model': '獏型',
  
  // Error handling patterns
  'throw new Error(': '投新誤(',
  'catch(error)': '捕(誤)',
  
  // Auth patterns
  'req.user': '請者',
  'req.body': '請体',
  'req.params': '請引',
  'req.headers': '請頭',
  'res.status(': '応状(',
  'res.json(': '応式(',
  'res.send(': '応送(',
  
  // Common error response patterns
  'res.status(400)': '応状(400)',
  'res.status(401)': '応状(401)',
  'res.status(404)': '応状(404)',
  'res.status(500)': '応状(500)',
  
  // Common data operations
  'JSON.parse(': '式解(',
  'JSON.stringify(': '式文(',
};
