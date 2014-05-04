function Locker(bm) {
	this.bleManager = bm;
}


/**
    Lock
  */

Locker.prototype.lock = function() {
	this.bleManager.write("l"+"\n");
}


/**
    Unlock
  */

Locker.prototype.unlock = function() {
	this.bleManager.write("u"+"\n");
}