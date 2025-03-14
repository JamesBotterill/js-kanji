/**
 * Kanji dictionary for character-level compression
 * 
 * This dictionary maps common JavaScript keywords, functions, and patterns
 * to single Kanji characters to maximize token efficiency.
 */

module.exports = {
  // Core JavaScript keywords
  'function': '関',     // kan - relation, connection
  'return': '返',       // hen - return
  'const': '定',        // tei - fixed, constant
  'let': '変',          // hen - change, variable
  'var': '数',          // suu - number, variable
  'if': '条',           // jou - condition
  'else': '他',         // ta - other
  'for': '繰',          // kuri - repeat
  'while': '間',        // ma - interval
  'try': '試',          // shi - try
  'catch': '捕',        // ho - catch
  'throw': '投',        // tou - throw
  'await': '待',        // tai - wait
  'async': '非',        // hi - non- (asynchronous)
  'class': '類',        // rui - class, type
  'import': '入',       // nyuu - enter, import
  'export': '出',       // shutsu - export
  'default': '既',      // ki - already established
  'new': '新',          // shin - new
  'this': '自',         // ji - self
  'true': '真',         // shin - truth
  'false': '偽',        // gi - falsehood
  'null': '無',         // mu - nothing
  'undefined': '未',    // mi - not yet
  
  // Common JavaScript built-ins
  'Object': '物',       // mono - thing, object
  'Array': '列',        // retsu - array
  'String': '文',       // bun - text
  'Number': '数',       // suu - number
  'Boolean': '論',      // ron - logic
  'Date': '日',         // hi - day, date
  'Math': '算',         // san - calculate
  'console': '示',      // ji - display
  'log': '録',          // roku - record
  'error': '誤',        // go - error
  'warn': '警',         // kei - warn
  
  // CommonJS/Node.js
  'require': '要',      // you - require
  'module': '組',       // kumi - module
  'exports': '送',      // sou - send
  'process': '過',      // ka - process
  'global': '全',       // zen - whole
  'Buffer': '緩',       // kan - buffer
  'setTimeout': '遅',   // chi - delay
  
  // File system
  'fs': '書',           // sho - write
  'readFile': '読',     // yomi - read
  'writeFile': '保',    // ho - preserve
  'mkdir': '創',        // sou - create
  'stat': '状',         // jou - state
  'path': '道',         // michi - path
  'join': '結',         // ketsu - join
  
  // Web/HTTP
  'http': '網',         // mou - network
  'request': '求',      // kyuu - request
  'response': '答',     // tou - response
  'server': '供',       // kyou - supply, serve
  'client': '客',       // kyaku - client
  'router': '路',       // ro - path
  'route': '経',        // kei - route
  'get': '取',          // tori - get
  'post': '送',         // okuri - send
  'put': '置',          // oki - put
  'delete': '消',       // shou - delete
  
  // Express/Web frameworks
  'express': '速',      // soku - express, speed
  'app': '応',          // ou - application
  'middleware': '中',   // chuu - middle
  'static': '固',       // katashi - fixed
  'session': '会',      // kai - meeting
  'cookie': '点',       // ten - point
  'body': '体',         // tai - body
  'params': '引',       // in - parameter
  'query': '問',        // mon - question, query
  
  // Database
  'database': '庫',     // ko - storehouse
  'connect': '接',      // setsu - connect
  'collection': '集',   // shuu - collection
  'document': '件',     // ken - document
  'model': '型',        // kata - model, type
  'schema': '図',       // zu - diagram, plan
  'find': '探',         // tan - find
  'findOne': '検',      // ken - examine
  'findById': '索',     // saku - search
  'save': '存',         // zon - exist, save
  'update': '更',       // kou - update
  'remove': '除',       // jo - remove
  'create': '造',       // zou - create
  'delete': '削',       // saku - delete
  
  // Promise/async
  'Promise': '約',      // yaku - promise
  'resolve': '決',      // ketsu - decide
  'reject': '否',       // hi - reject
  'then': '続',         // zoku - continue
  'catch': '獲',        // kaku - capture
  'finally': '終',      // shu - end
  
  // Array methods
  'map': '写',          // sha - copy, map
  'filter': '濾',       // ro - filter
  'reduce': '縮',       // shuku - reduce
  'forEach': '各',      // kaku - each
  'some': '一',         // ichi - some
  'every': '皆',        // kai - all
  'find': '見',         // mi - see
  'includes': '含',     // gan - include
  'push': '添',         // ten - add
  'pop': '取',          // tori - take
  'shift': '抜',        // nu - pull out
  'unshift': '挿',      // sou - insert
  
  // String methods
  'split': '割',        // wari - divide
  'join': '繋',         // tsunagi - connect
  'replace': '換',      // kan - exchange
  'match': '合',        // go - match
  'slice': '切',        // ki - cut
  'substring': '部',    // bu - part
  'trim': '整',         // sei - arrange, tidy
  'toLowerCase': '低',  // tei - low
  'toUpperCase': '高',  // kou - high
  
  // Common variables/parameters
  'data': '資',         // shi - data
  'result': '果',       // ka - result
  'options': '選',      // sen - selection
  'config': '設',       // setsu - setup
  'user': '者',         // mono - person
  'item': '品',         // hin - item
  'index': '位',        // kurai - position
  'key': '鍵',          // kagi - key
  'value': '値',        // atai - value
  'name': '名',         // mei - name
  'id': '番',           // ban - number
  'file': '件',         // ken - matter, file
  'url': '所',          // tokoro - place
  'path': '跡',         // ato - track, path
  
  // Operators and symbols (beyond the basic ones)
  'length': '長',       // naga - length
  'typeof': '型',       // kata - type
  'instanceof': '例',   // rei - instance
  
  // Web scraping specific
  'axios': '送信',      // soushin - send message
  'cheerio': '解析',    // kaiseki - analyze
  'parse': '解',        // kai - solve
  'scrape': '収',       // shu - gather
  'extract': '抽',      // chuu - extract
  'selector': '指',     // shi - point
  'element': '素',      // so - element
  'attribute': '属',    // zoku - attribute
  'html': '頁',         // ketsu - page
  'text': '字',         // ji - character
};
