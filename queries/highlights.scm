(declaration lhs: (_) @function)
(declaration rhs: (_) @attribute)
(number) @number
(comment) @comment
(string) @string
(true) @constant
(false) @constant
(tag) @comment
"=" @operator
"->" @operator
"=>" @operator
"::" @operator
"where" @keyword
"module" @keyword
"import" @keyword
"source" @keyword
"from" @keyword
"as" @keyword
"type" @keyword
"," @punctuation.delimiter
"{" @punctuation.bracket
"}" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"(" @punctuation.bracket
")" @punctuation.bracket

; Capture Name                 Meaning
; @keyword                     Language keywords
; @function                    Function names or declarations
; @function.builtin            Built-in functions
; @type                        Types (classes, structs, enums)
; @type.builtin                Built-in types (int, float, etc.)
; @variable                    Variable names
; @variable.builtin            Built-in variables or constants
; @variable.parameter          Function or method parameters
; @property                    Object properties
; @property.builtin            Built-in properties
; @constant                    Constants
; @constant.builtin            Built-in constants
; @string                      String literals
; @string.special              Special string formats (e.g. regex)
; @number                      Numeric literals
; @comment                     Comments
; @operator                    Operators
; @punctuation                 Punctuation characters
; @punctuation.bracket         Brackets (parentheses, braces)
; @punctuation.delimiter       Delimiters (comma, semicolon)
; @tag                         Tags (for XML, HTML, etc.)
; @attribute                   Attributes
; @parameter                   Function parameters
; @namespace                   Namespaces
; @label                       Labels (goto targets)
