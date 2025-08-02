(declaration lhs: (_) @function)
(declaration rhs: (_) @variable)
(declaration arg: (_) @variable)

(signature name: (_) @type)

(number) @number
(string) @string
(true) @constant
(false) @constant

(lineComment) @comment
(blockComment) @comment
(tag) @keyword.directive

[
  "="
  "->"
  "=>"
  "::"
  "." 
] @operator

[
  "module"
  "import"
  "source"
  "from"
  "as"
] @keyword.import

[
  "where"
  "type"
] @keyword


"," @punctuation.delimiter

[
  "{"
  "}"
  "["
  "]"
  "("
  ")"
] @punctuation.bracket
