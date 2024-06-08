MadFile = function(ui, data, meta)
{
    DrawioFile.call(this, ui, data);

    this.meta = meta;
    this.ui.mad = this.ui;
};

//Extends mxEventSource
mxUtils.extend(MadFile, DrawioFile);

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.getId = function()
{
    return encodeURIComponent(this.meta.org) + '/' +
    ((this.meta.appid != null) ? encodeURIComponent(this.meta.appid) + '/' +
    ((this.meta.recent != null) ? this.meta.recent +
    ((this.meta.time != null) ? '/' + this.meta.time : '') : '') : '');
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.getHash = function()
{
    return encodeURIComponent('M' + this.getId());
};

/**
 * Returns true if copy, export and print are not allowed for this file.
 */
MadFile.prototype.getFileUrl = function()
{
    return 'https://localhost/mad/editor/' + encodeURIComponent(this.meta.org) + '/' +
        encodeURIComponent(this.meta.appid) + '/blob/' +
        this.meta.recent + '/' + this.meta.time;
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.getMode = function()
{
    return App.MODE_MAD;
};

/**
 * Overridden to enable the autosave option in the document properties dialog.
 */
MadFile.prototype.isAutosaveOptional = function()
{
    return true;
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.getTitle = function()
{
    return this.meta.name;
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.isRenamable = function()
{
    return true;
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.save = function(success, error, unloading, overwrite)
{
    this.doSave(this.getTitle(), success, error, unloading, overwrite);
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.saveAs = function(title, success, error)
{
    this.doSave(title, success, error);
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.doSave = function(title, success, error, unloading, overwrite)
{
    // Forces update of data for new extensions
    var prev = this.meta.name;
    this.meta.name = title;

    DrawioFile.prototype.save.apply(this, [null, mxUtils.bind(this, function()
    {
        this.meta.name = prev;
        this.saveFile(title, success, error, unloading, overwrite);
    }), error, unloading, overwrite]);
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.saveFile = function(title, success, error)
{
    // if (!this.isEditable())
    // {
    //     if (success != null)
    //     {
    //         success();
    //     }
    // }
    // else if (!this.savingFile)
    // {

    console.log("MadFile.prototype.saveFile");

        var fn = mxUtils.bind(this, function(checked)
        {
            if (checked)
            {
                try
                {
                    // Sets shadow modified state during save
                    this.savingFileTime = new Date();
                    this.setShadowModified(false);
                    this.savingFile = true;

                    var doSave = mxUtils.bind(this, function(data)
                    {
                        // var index = this.stat.path_display.lastIndexOf('/');
                        // var folder = (index > 1) ? this.stat.path_display.substring(1, index + 1) : null;

                        this.ui.mad.saveFile(title, data, mxUtils.bind(this, function(meta)
                        {

                            // Checks for changes during save
                            this.setModified(this.getShadowModified());
                            this.savingFile = false;
                            this.meta = meta;
                            this.contentChanged();

                            if (success != null)
                            {
                                success();
                            }
                        }), mxUtils.bind(this, function(err)
                        {
                            this.savingFile = false;

                            if (error != null)
                            {
                                error(err);
                            }
                        }));
                    });

                    if (this.ui.useCanvasForExport && /(\.png)$/i.test(this.getTitle()))
                    {
                        var p = this.ui.getPngFileProperties(this.ui.fileNode);

                        this.ui.getEmbeddedPng(mxUtils.bind(this, function(data)
                        {
                            doSave(this.ui.base64ToBlob(data, 'image/png'));
                        }), error, (this.ui.getCurrentFile() != this) ?
                            this.getData() : null, p.scale, p.border);
                    }
                    else
                    {
                        doSave(this.getData());
                    }
                }
                catch (e)
                {
                    this.savingFile = false;

                    if (error != null)
                    {
                        error(e);
                    }
                    else
                    {
                        throw e;
                    }
                }
            }
            else if (error != null)
            {
                error();
            }
            else
            {
                // Sets shadow modified state during save
                this.savingFileTime = new Date();
                this.setShadowModified(false);
                this.savingFile = true;

                this.ui.mad.insertFile(title, this.getData(), mxUtils.bind(this, function(file)
                {
                    // Checks for changes during save
                    this.setModified(this.getShadowModified());
                    this.savingFile = false;

                    if (success != null)
                    {
                        success();
                    }

                    this.ui.fileLoaded(file);
                }), mxUtils.bind(this, function()
                {
                    this.savingFile = false;

                    if (error != null)
                    {
                        error();
                    }
                }));
            }
        });

        if (this.getTitle() == title)
        {
            fn(true);
        }
        else
        {
            this.ui.mad.checkExists(title, fn);
        };
    // }
    if (error != null)
    {
        error({code: App.ERROR_BUSY});
    }
};

/**
 * Translates this point by the given vector.
 *
 * @param {number} dx X-coordinate of the translation.
 * @param {number} dy Y-coordinate of the translation.
 */
MadFile.prototype.rename = function(title, success, error)
{
    this.ui.mad.renameFile(this, title, mxUtils.bind(this, function(stat)
    {
        if (!this.hasSameExtension(title, this.getTitle()))
        {
            this.meta = meta;
            // Required in this case to update hash tag in page
            // before saving so that the edit link is correct
            this.descriptorChanged();
            this.save(true, success, error);
        }
        else
        {
            this.meta = meta;
            this.descriptorChanged();

            if (success != null)
            {
                success();
            }
        }
    }), error);
};
