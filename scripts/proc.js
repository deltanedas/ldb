module.exports = block => {
	const build = block.newBuilding().class;
	block.buildType = () => extend(build, block, {
		buildConfiguration(table) {
			this.super$buildConfiguration(table);
			// Remove long black bar due to collapser
			table.background(null);
			table.cells.get(0).right();
			const button = table.button(Icon.upOpen, Styles.clearTransi, () => {
				this.table.toggle();
				button.style.imageUp = this.table.collapsed ? Icon.upOpen : Icon.downOpen;
			}).size(40).left().get();

			this.buildVariables();
			table.row();
			table.add(this.table).size(300, 200).bottom().pad(2);
		},

		buildVariables() {
			this.table = new Collapser(table => {
				table.pane(pane => {
					pane.background(Styles.black6);
					for (var v of this.executor.vars) {
						pane.label(this.varVal(v)).padLeft(10).left().get().alignment = Align.left;
						pane.row();
					}
				}).grow().margin(10).pad(10);
			}, true);
		},

		varVal: v => () => {
			if (v.isobj) {
				if (typeof(v.objval) == "string") {
					return v.name + ': "' + v.objval + '"';
				}
				return v.name + ": " + v.objval;
			}

			return v.name + ": " + v.numval;
		},

		table: null
	});
};
