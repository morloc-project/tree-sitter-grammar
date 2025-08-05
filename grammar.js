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

  externals: $ => [$._indent, $._dedent, $._left_aligned, /\n/],

  extras: $ => [/\s/, /\n/, /\r/, $.lineComment, $.blockComment],

  conflicts: $ => [[$.signature, $.declaration]],

  rules: {
    source_file: $ => seq($._toplevel, repeat(seq($._left_aligned, optional($._toplevel)))),

    word: $ => $.identifier,

    _toplevel: $ => choice(
      $.module,
      $.import,
      $.source,
      $.typeclass,
      $.instance,
      $.typedef,
      $.recdef,
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
      field("modulePath", $.modulePath),
      parens(
        choice(
          $.star,
          sepBy($.identifier, ",")
        )
      )
    ),

    star: $ => "*",

    modulePath: $ => sepBy1(field("segment", $.identifier), "."),

    // --------- IMPORT --------------------------------------------------------

    import: $ => seq(
      "import",
      field("modulePath", $.modulePath),
      optional(parens(sepBy($.importTerm, ",")))
    ),

    importTerm: $ => seq(
      choice(
        field("term", $.identifier),
        field("type", $.identifierU)
      ),
      optional(seq("as", field("alias", $.identifier)))
    ),


    // --------- SOURCE --------------------------------------------------------

    source: $ => seq(
      "source",
      $.language,
      field("sourceFile", optional(seq( "from", $.string))),
      parens(sepBy($.sourceTerm, ","))
    ),

    sourceTerm: $ => seq(
      field("name", $.string),
      optional(seq("as", field("alias", $.identifier)))
    ),

    // --------- SIGNATURE -----------------------------------------------------

    signature: $ => seq(
      field("name", $.identifier),
      field("arg", repeat($.identifier)),
      "::",
      field("value", $._type)
    ),

    // --------- TYPEDEF -------------------------------------------------------

    typedef: $ => seq(
      "type",
      optional(seq(
        $.language,
        "=>"
      )),
      $._type,
      "=",
      choice(
        $._type,
        field("native", seq($.string, repeat($._typeCommon)))
      )
    ),

    recdef: $ => seq(
      $._recform,
      optional(seq(
        $.language,
        "=>"
      )),
      $._recordName,
      "=", 
      $._recordType
    ),

    _recform: $ => choice(
        $.recordDef,
        $.tableDef,
        $.objectDef 
    ),

    recordDef: $ => "record",
    tableDef: $ => "table",
    objectDef: $ => "object",

    _recordType: $ => seq(
      field("constructor", choice(
        $.identifierU,
        $.string
      )),
      optional(seq(
      "{",
      field("entry", sepBy($.recordTypeEntry, ",")),
      "}"
      ))
    ),

    recordTypeEntry: $ => seq(
      field("key", $.identifier),
      "::",
      field("value", $._type)
    ),

    _recordName: $ => choice(
      parens($._recordName),
      seq(
        field("name", $.identifierU),
        field("param", repeat($.identifier))
      )
    ),

    // --------- TYPE -------------------------------------------------------

    _type: $ => choice(
      $._typeCommon,
      $.paramT,
      $.functionT
    ),

    paramT: $ => seq($._taggableIdentifierLU, repeat1($._typeParamGroup)),

    // types allowed as parameters
    _typeParamGroup: $ => choice(
      $._typeCommon
    ),

    functionT: $ => sepBy2($._typeFunGroup, "->"),

    // types allowed in functions
    _typeFunGroup: $ => choice(
      $._typeCommon,
      $.paramT
    ),

    // type patterns that are safe in all contexts
    _typeCommon: $ => choice(
      $._taggableIdentifierLU,
      $.listType,
      $.tupleType,
      parens($._type),
      seq("(", ")")
    ),

    listType: $ => brackets($._type),
    tupleType: $ => parens(sepBy2($._type, ",")),


    // --------- TYPECLASS -----------------------------------------------------

    typeclass: $ => seq(
      "class", 
      field("class", $.identifierU), 
      field("param", repeat($._typeCommon)),
      field("where", $.interface)
    ),

    interface: $ => seq(
      "where",
      $._indent,
      repeat1(seq($._left_aligned, $.signature)),
      $._dedent
    ),


    // --------- INSTANCE ------------------------------------------------------

    instance: $ => seq(
      "instance",
      field("class", $.identifierU), 
      field("param", repeat($._typeCommon)),
      field("where", $.implementation)

    ),

    implementation: $ => seq(
      "where",
      $._indent,
      repeat1(seq($._left_aligned, choice($.source, $.declaration))),
      $._dedent
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

    composition: $ => sepBy2($._functionLike, "."),

    _expressionSimple: $ => choice(
      $._term,
      $._primitiveExpr,
      $.listExpr,
      $.tupleExpr,
      $.recordExpr,
      parens($.application)
    ),

    _functionLike: $ => choice(
      $._term,
      $.application
    ),

    _taggableIdentifierLU: $ => choice(
      field("generic", $.identifier),
      field("concrete", $.identifierU),
      $.taggedType
    ),

    // language: $ => /[A-Za-z][A-Za-z0-9]*/,
    language: $ => choice(
      /[Rr]/,
      /[Cc]pp/,
      /[Pp]y/,
      /[Pp]ython3?/
    ),

    taggedType: $ => seq(
      $.tag,
      choice(
        field("generic", $.identifier),
        field("concrete", $.identifierU)
      )
    ),

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
