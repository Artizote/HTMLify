#include <stdio.h>
#include <string.h>
#include "engine.h"

const char *index_file_path = "index.index";

void search_index_tokens(int file_id, const char* tokens_file_path) {
    FILE *tokens_file = fopen(tokens_file_path, "r");
    if (tokens_file == NULL) {
        return;
    }
    char buffer[1024], token[1024];
    fgets(token, 1024, tokens_file);
}

SearchResult *search_query(const char* query);

void search_clean(const char* token);
