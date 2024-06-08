MadLibrary = function(ui, data, meta)
{
    MadFile.call(this, ui, data, meta);
};

mxUtils.extend(MadLibrary, MadFile);

MadLibrary.prototype.isAutosave = function()
{
    return true;
};

/**
 * Overridden to avoid updating data with current file.
 */
MadLibrary.prototype.doSave = function(title, success, error)
{
    this.saveFile(title, false, success, error);
};

/**
 * Returns the location as a new object.
 * @type mx.Point
 */
MadLibrary.prototype.open = function()
{
    // Do nothing - this should never be called
};
