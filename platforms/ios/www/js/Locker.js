function Locker(bm) {
	console.log('Locker');
	this.bleManager = bm;
}


/**
    Lock
  */

Locker.prototype.lock = function() {
	console.log('Locker::lock');
	this.bleManager.write("l"+"\n");
}


/**
    Unlock
  */

Locker.prototype.unlock = function() {
	console.log('Locker::unlock');
	this.bleManager.write("u"+"\n");
}