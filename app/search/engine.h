/* Search Engine */

#ifndef SEARCH_ENGINE
#define SEARCH_ENGINE

typedef struct SearchResult {
    int file_id;
    int score;
    int apear_offset;
    char *tokens;
} SearchResult;

void search_index_file(int file_id, const char* filepath);

SearchResult *search_query(const char* query);

void search_clean(const char* keyword);

#endif
