const mem = require("ldb/mem");
const proc = require("ldb/proc");

Events.on(ClientLoadEvent, () => {
	const blocks = Vars.content.blocks().items;
	for (var block of blocks) {
		if (block instanceof MemoryBlock) {
			mem(block);
		} else if (block instanceof LogicBlock) {
			proc(block);
		}
	}
});
