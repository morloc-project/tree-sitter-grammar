// scanner.c
#include <tree_sitter/parser.h>
#include <wctype.h>
#include <string.h>

#define MAX_INDENT 127

enum TokenType {
  INDENT,
  DEDENT,
  NEWLINE,
  LEFT_ALIGNED
};

typedef struct {
  uint32_t indents[MAX_INDENT];
  uint32_t level;
} IndentStack;

bool tree_sitter_morloc_external_scanner_scan(
    void *payload, TSLexer *lexer,
    const bool *valid_symbols)
{
    // store indent column numbers
    static IndentStack stack = { 0 };
    static bool in_whitespace = true;
    static uint32_t dedent_space = 0;

    if(lexer->lookahead == '\n'){
        in_whitespace = true;
        lexer->advance(lexer, true);
        dedent_space = 0;
    }

    if(valid_symbols[DEDENT] && lexer->get_column(lexer) == 0){
        if(stack.level == 1){
            if(lexer->get_column(lexer) == stack.indents[0] && lexer->lookahead != ' '){
                lexer->result_symbol = DEDENT;
                stack.indents[1] = 0;
                stack.level--;
                return true;
            }
        }

        /* // No indentation, so dedentation is impossible                */
        /* if(stack.level == 0){                                          */
        /*     return false;                                              */
        /* }                                                              */
        /* while(lexer->lookahead == ' '){                                */
        /*     lexer->advance(lexer, true);                               */
        /* }                                                              */
        /* in_whitespace = false;                                         */
        /* // This is the first dedent                                    */
        /* if (dedent_space == 0){                                        */
        /*     if(lexer->get_column(lexer) < stack.indents[stack.level]){ */
        /*         dedent_space = lexer->get_column(lexer);               */
        /*     } else {                                                   */
        /*         return false;                                          */
        /*     }                                                          */
        /* }                                                              */
        /* stack.level--;                                                 */
        /* if(dedent_space < stack.indents[stack.level]){                 */
        /*     return false;                                              */
        /* }                                                              */
        /* while(dedent_space > stack.indents[stack.level]){              */
        /*     dedent_space--;                                            */
        /* }                                                              */
        /* lexer->result_symbol = DEDENT;                                 */
        /* return true;                                                   */
    }

    if(valid_symbols[LEFT_ALIGNED]){
        if(in_whitespace){
            while(lexer->get_column(lexer) < stack.indents[stack.level]){
                if(lexer->lookahead == ' '){
                    lexer->advance(lexer, true);
                } else {
                    in_whitespace = false;
                    return false;
                }
            }
        }

        if(lexer->get_column(lexer) == stack.indents[stack.level] && lexer->lookahead != ' ') {
            in_whitespace = false;
            lexer->result_symbol = LEFT_ALIGNED;
            return true;
        } else {
            return false;
        }
    }

    if(lexer->get_column(lexer) == 0 && valid_symbols[INDENT]){
        while(lexer->lookahead == ' '){
            lexer->advance(lexer, true);
        }
        in_whitespace = false;
        if(lexer->get_column(lexer) > stack.indents[stack.level]){
            stack.level++;
            stack.indents[stack.level] = lexer->get_column(lexer);
            lexer->result_symbol = INDENT;
            return true;
        } else {
            return false;
        }
    }

    return false;
}
          
void *tree_sitter_morloc_external_scanner_create() { return NULL; }

void tree_sitter_morloc_external_scanner_destroy(void *payload) {}

void tree_sitter_morloc_external_scanner_reset(void *payload) {}

unsigned tree_sitter_morloc_external_scanner_serialize(void *payload, char *buffer) { return 0; }

void tree_sitter_morloc_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}
