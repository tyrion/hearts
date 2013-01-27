var main = require('./main');

require('./reloader')(main.app);
require('./routes');

main.server.listen(8000, '192.168.56.101');
