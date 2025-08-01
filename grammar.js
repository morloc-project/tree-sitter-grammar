function sepBy1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}

function sepBy(rule, separator) {
  return optional(sepBy1(rule, separator));
}

function sepBy2(rule, separator) {
  return seq(rule, repeat1(seq(separator, rule)));
}

function parens(rule) {
  return seq("(", rule, ")");
}

function brackets(rule) {
  return seq("[", rule, "]");
}

function braces(rule) {
  return seq("{", rule, "}");
}

module.exports = grammar({

  name: 'morloc',

  externals: $ => [$._indent, $._dedent, $._left_aligned, $._eof],

  extras: $ => [/\s/, /\n/, /\r/, $.lineComment, $.blockComment],

  conflicts: $ => [[$.signature, $.declaration]],

  rules: {
    source_file: $ => seq(sepBy1($._toplevel, $._left_aligned), $._eof),

    word: $ => $.identifier,

    _toplevel: $ => choice(
      $.module,
      $.import,
      $.source,
      $.typedef,
      $.signature,
      $.declaration
    ),


    // --------- COMMENT ------------------------------------------------------

    // general comment
    lineComment: $ => /--[^\n\r]*/,

    blockComment: $ => seq(
      "{-",
      repeat(choice(
        /[^-][}]/,
        /.[^}]/,
      )),
      "-}"
    ),

    // --------- MODULE --------------------------------------------------------

    // module <module_name> ([export..])
    module: $ => seq(
      "module",
      field("moduleName", $.identifier),
      parens(
        choice(
          "*",
          sepBy($.identifier, ",")
        )
      )
    ),

    // --------- IMPORT --------------------------------------------------------

    import: $ => seq(
      "import",
      field("moduleName", $.identifier),
      optional(parens(sepBy($.importTerm, ",")))
    ),

    importTerm: $ => seq(
      field("name", $.identifier),
      optional(seq("as", field("alias", $.identifier)))
    ),


    // --------- SOURCE --------------------------------------------------------

    source: $ => seq(
      "source",
      field("language", $.identifierU),
      field("sourceFile", optional(seq( "from", $.string))),
      parens(sepBy($.sourceTerm, ","))
    ),

    sourceTerm: $ => seq(
      field("name", $.string),
      optional(seq("as", field("alias", $.identifier)))
    ),

    // --------- SIGNATURE -----------------------------------------------------

    signature: $ => seq(
      $.identifier,
      repeat($.identifier),
      "::",
      $.type
    ),

    // --------- TYPEDEF -------------------------------------------------------

    typedef: $ => seq(
      "type",
      optional(seq($.identifierU, "=>")),
      $.type,
      "=",
      choice($.type, seq($.string, repeat($.identifier)))
    ),

    // --------- TYPE -------------------------------------------------------

    type: $ => choice(
      seq($.taggableIdentifierLU, repeat($._typeGroup)),
      $._sugarTypes,
      parens($.type),
      sepBy2($._typeGroup, "->"),
      seq("(", ")")
    ),

    // types
    _typeGroup: $ => choice(
      $.taggableIdentifierLU,
      $._sugarTypes,
      parens($.type),
      seq("(", ")")
    ),

    _sugarTypes: $ => choice(
      brackets($.type),
      parens(sepBy2($.type, ","))
    ),

    // --------- DECLARATION ---------------------------------------------------

    declaration: $ => seq(
      field("lhs", $.identifier),
      repeat(field("arg", $.identifier)),
      '=',
      field("rhs", $._expression),
      field("where", optional($.block))
    ),

    block: $ => seq(
      "where",
      $._indent,
      repeat1(seq($._left_aligned, $.declaration)),
      $._dedent
    ),

    _expression: $ => choice(
      $.application,
      $.composition,
      $._expressionSimple
    ),

    application: $ => choice(
      seq(
        $._term,
        repeat1($._expressionSimple)
      ),
      seq(
        parens(choice(
          $.application,
          $.composition,
          $._term
        )),
        repeat1($._expressionSimple)
      )
    ),

    composition: $ => sepBy2($._expressionSimple, "."),

    _expressionSimple: $ => choice(
      $._term,
      $._primitiveExpr,
      $.listExpr,
      $.tupleExpr,
      $.recordExpr,
      parens($.application)
    ),

    taggableIdentifierLU: $ => seq(optional($.tag), choice($.identifier, $.identifierU)),


    // Morloc terms can be associated with metadata
    //
    _term: $ => choice(
      field("taggedTerm",  seq($.tag, $.identifier)),
      field("term", $.identifier)
    ),

    tag: $ => /[a-z][a-zA-Z0-9]*:/,

    identifier: $ => /[a-z][a-zA-Z0-9_']*/,

    identifierU: $ => /[A-Z][a-zA-Z0-9]*/,

    listExpr: $ => brackets(sepBy($._expression, ",")),

    // a tuple, which must contain at least 2 elements
    tupleExpr: $ => parens(sepBy2($._expression, ",")),

    recordExpr: $ => braces(sepBy($.recordExprEntry, ",")),

    recordExprEntry: $ => seq(
      $.identifier,
      "=",
      $._expression
    ),

    _primitiveExpr: $ => choice(
      $.string,
      $.number,
      $._boolean
    ),

    string: $ => /"(?:\\.|[^"\\])*"/,
    number: $ => /-?\d+(\.\d+)?([eE][+-]?\d+)?/,
    _boolean: $ => choice( $.true, $.false ),
    true: $ => 'True',
    false: $ => 'False'
  }
});
