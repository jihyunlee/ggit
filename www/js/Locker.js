function Locker(bm) {
	this.bleManager = bm;
	this.lockStatus = false;
}


/**
    Lock
  */

Locker.prototype.lock = function() {
	this.setLockStatus(true);
	this.bleManager.write("l"+"\n");
}


/**
    Unlock
  */

Locker.prototype.unlock = function() {
	this.setLockStatus(false);
	this.bleManager.write("u"+"\n");
}


Locker.prototype.setLockStatus = function(lockStatus) {
	this.lockStatus = lockStatus;
}

Locker.prototype.getLockStatus = function() {
	return this.lockStatus;
}