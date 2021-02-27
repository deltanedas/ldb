global.override.block(LogicBlock, {
	buildConfiguration(table) {
		this.super$buildConfiguration(table);
		// Remove long black bar due to collapser
		table.background(null);
		table.cells.get(0).right();
		const button = table.button(Icon.upOpen, Styles.clearTransi, () => {
			this.collapser.toggle();
			button.style.imageUp = this.collapser.collapsed ? Icon.upOpen : Icon.downOpen;
		}).size(40).left().get();

		this.ldbBuildVariables();
		table.row();
		table.add(this.collapser).size(300, 300).bottom().colspan(2);
	},

	ldbBuildVariables() {
		this.collapser = new Collapser(table => {
			let back = new BaseDrawable(Styles.none);
			back.minHeight = 300;
			table.background(back);
			table.pane(tableInPane => {
				tableInPane.left().top().margin(10);
				tableInPane.background(Styles.black6);
				for (var v of this.executor.vars) {
					// Only show the constant @unit
					if (!v.constant || v.name == "@unit") {
						tableInPane.label(this.ldbVarVal(v)).padLeft(10).left().get().alignment = Align.left;
						tableInPane.row();
					}
				}
			}).grow().left().margin(10).pad(10);
		}, true);
	},

	ldbVarVal: v => () => {
		if (v.isobj) {
			if (typeof(v.objval) == "string") {
				return v.name + ': "' + v.objval + '"';
			}
			return v.name + ": " + v.objval;
		}

		return v.name + ": " + v.numval;
	},

	ldbTable: null
});
