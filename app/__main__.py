from . import *

Thread(target=search_indexing_daemon, args=(TermFrequency, app, files), daemon=True).start()
Thread(target=process_pool_purger, args=(PROCESS_POOL,), daemon=True).start()
app.run(debug=True)
