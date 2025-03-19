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
  'super': '親',        // oya - parent
  'static': '静',       // sei - static
  'extends': '継',      // kei - continue, extend
  'implements': '実',   // jitsu - implement, practice
  
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
  'info': '知',         // chi - know, info
  'JSON': '換',         // kan - exchange
  'Map': '図',          // zu - map, diagram
  'Set': '組',          // kumi - set, group
  'Symbol': '符',       // fu - symbol
  'RegExp': '式',       // shiki - expression
  
  // CommonJS/Node.js
  'require': '要',      // you - require
  'module': '組',       // kumi - module
  'exports': '送',      // sou - send
  'process': '過',      // ka - process
  'global': '全',       // zen - whole
  'Buffer': '緩',       // kan - buffer
  'setTimeout': '遅',   // chi - delay
  'setInterval': '周',  // shu - cycle
  'clearTimeout': '取消', // torikeshi - cancel
  'clearInterval': '停止', // teishi - stop
  '__dirname': '本処',  // honsho - this place
  '__filename': '本名', // honmei - this name
  
  // File system
  'fs': '書',           // sho - write
  'readFile': '読',     // yomi - read
  'writeFile': '保',    // ho - preserve
  'mkdir': '創',        // sou - create
  'stat': '状',         // jou - state
  'path': '道',         // michi - path
  'join': '結',         // ketsu - join
  'readdir': '列挙',    // retsukyo - enumeration
  'unlink': '削除',     // sakujo - delete
  'rename': '改名',     // kaimei - rename
  'stream': '流',       // ryu - stream, flow
  'pipe': '管',         // kan - pipe
  
  // Web/HTTP
  'http': '網',         // mou - network
  'https': '網安',      // mou-an - secure network
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
  'fetch': '獲',        // kaku - obtain
  'headers': '頭',      // atama - head
  'status': '態',       // tai - status
  'method': '法',       // hou - method
  'protocol': '規',     // ki - rule, protocol
  
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
  'router': '路',       // ro - router
  'controller': '制',   // sei - control
  'view': '見',         // ken - view
  'render': '画',       // ga - draw
  'redirect': '転',     // ten - transfer
  'next': '次',         // ji - next
  
  // Modern Frontend
  'React': '反',        // han - react 
  'useState': '状態',   // joutai - state
  'useEffect': '効果',  // kouka - effect
  'props': '属性',      // zokusei - properties
  'component': '部品',  // buhin - component
  'render': '描画',     // byouga - render
  'Vue': '景',          // kei - view
  'Angular': '角',      // kaku - angle
  'Svelte': '軽',       // kei - light
  'template': '型紙',   // katagami - template
  'style': '様式',      // youshiki - style
  
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
  'query': '詢',        // jun - inquiry
  'select': '選',       // sen - select
  'where': '処',        // sho - place, where
  'aggregate': '集計',  // shuukei - aggregate
  'index': '索引',      // sakuin - index
  'transaction': '取引', // torihiki - transaction
  'commit': '確定',     // kakutei - commit
  'rollback': '巻戻',   // makimodo - rollback
  
  // MongoDB specific
  'mongoose': '獏',     // baku - mongoose (mythical creature)
  'ObjectId': '物番',   // mono-ban - object id
  'populate': '充',     // ju - fill
  
  // SQL specific
  'table': '表',        // hyo - table
  'join': '結合',       // ketsugo - join
  'inner': '内',        // nai - inner
  'outer': '外',        // gai - outer
  'left': '左',         // hidari - left
  'right': '右',        // migi - right
  'group': '群',        // gun - group
  'order': '順',        // jun - order
  'by': '別',           // betsu - by
  'having': '持',       // ji - having
  'limit': '限',        // gen - limit
  'offset': '移',       // i - shift
  
  // Promise/async
  'Promise': '約',      // yaku - promise
  'resolve': '決',      // ketsu - decide
  'reject': '否',       // hi - reject
  'then': '続',         // zoku - continue
  'catch': '獲',        // kaku - capture
  'finally': '終',      // shu - end
  'all': '全部',        // zenbu - all
  'race': '競争',       // kyousou - race
  'any': '何',          // nan - any
  'settled': '解決',    // kaiketsu - settled
  
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
  'slice': '薄切',      // usugiri - slice
  'splice': '接続',     // setsuzoku - splice
  'concat': '連結',     // renketsu - concatenate
  'sort': '並',         // nami - sort
  'reverse': '逆',      // gyaku - reverse
  'flat': '平',         // hira - flat
  'flatMap': '平写',    // hira-sha - flatMap
  
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
  'charAt': '位置',     // ichi - position
  'indexOf': '索引位置', // sakuin-ichi - index position
  'startsWith': '始',   // hajime - start
  'endsWith': '終',     // owari - end
  'padStart': '前詰',   // maezume - pad start
  'padEnd': '後詰',     // atodzume - pad end
  
  // Testing
  'test': '試験',       // shiken - test
  'describe': '説明',   // setsumei - describe
  'it': '例証',         // reishou - example
  'expect': '期待',     // kitai - expect
  'assert': '断言',     // dangen - assert
  'mock': '模造',       // mozou - mock
  'spy': '諜',          // chou - spy
  'before': '前',       // zen - before
  'after': '後',        // go - after
  'beforeEach': '各前', // kaku-zen - beforeEach
  'afterEach': '各後',  // kaku-go - afterEach
  
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
  'args': '引数',       // hikisuu - arguments
  'params': '引数',     // hikisuu - parameters
  'callback': '呼戻',   // yobimodoshi - callback
  'payload': '積載',    // sekisai - payload
  'error': '過誤',      // kago - error
  'success': '成功',    // seikou - success
  'failure': '失敗',    // shippai - failure
  'timeout': '時限',    // jigen - time limit
  'event': '事象',      // jishou - event
  'handler': '処理者',  // shorimon - handler
  'message': '信',      // shin - message
  
  // Operators and symbols (beyond the basic ones)
  'length': '長',       // naga - length
  'typeof': '型',       // kata - type
  'instanceof': '例',   // rei - instance
  'void': '空',         // kara - empty
  'delete': '除去',     // jokyo - remove
  'in': '中間',         // chukan - inside
  'of': '所属',         // shozoku - belonging
  
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
  'DOM': '構造',        // kouzou - structure
  'CSS': '様式',        // youshiki - style
  'xpath': '経路',      // keiro - path
  
  // Machine Learning/AI
  'model': '模型',      // mokei - model
  'train': '訓練',      // kunren - train
  'predict': '予測',    // yosoku - predict
  'classify': '分類',   // bunrui - classify
  'cluster': '集団',    // shuudan - cluster
  'feature': '特徴',    // tokuchou - feature
  'label': '標識',      // hyoushiki - label
  'tensor': '張量',     // chouryou - tensor
  'vector': '方向',     // houkou - vector
  'matrix': '行列',     // gyouretsu - matrix
};
