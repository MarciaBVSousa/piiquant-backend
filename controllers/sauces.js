const Sauce = require('../models/sauce');
const fileSystem = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(
            sauces
        ))
        .catch((err) => res.status(404).json({
            error: new Error('Could not complete request.')
        }))
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then((sauce) => res.status(200).json(
            sauce
        ))
        .catch((err) => res.status(404).json({
            error: new Error('Could not complete request.')
        }))
};

exports.createSauce = (req, res, next) =>  {
    const url = req.protocol + '://' + req.get('host');
    req.body.sauce = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        userId: req.body.sauce.userId,
        name: req.body.sauce.name,
        manufacturer: req.body.sauce.manufacturer,
        description: req.body.sauce.description,
        mainPepper: req.body.sauce.mainPepper,
        imageUrl: url + '/images/' + req.file.filename,
        heat: req.body.sauce.heat,
        likes: +0,
        dislikes: +0,
        usersLiked: [],
        usersDisliked:  []
    });
    sauce.save()
        .then(() => {
            res.status(201).json({
                message: 'Sauce successfully saved!'
            })
        })
        .catch(() => {
            res.status(400).json({
                error: new Error('Could not save sauce.')
            })
        })
};

exports.modifySauce = (req, res, next) => {
    let sauce = new Sauce();
    if(req.file) {
        const url = req.protocol + '://' + req.get('host');
        req.body.sauce = JSON.parse(req.body.sauce);

        sauce = {
            _id: req.params.id,
            name: req.body.sauce.name,
            manufacturer: req.body.sauce.manufacturer,
            description: req.body.sauce.description,
            mainPepper: req.body.sauce.mainPepper,
            imageUrl: url + '/images/' + req.file.filename,
            heat: req.body.sauce.heat,
        };

        Sauce.findOne({_id: req.params.id})
        .then((previousSauce) => {
            const filename = previousSauce.imageUrl.split('/images/')[1];
            fileSystem.unlink('images/' + filename, (err) => {
                if(err) {
                    throw 'Unable to update image';
                };
            });
        })
        .catch(() => {
            res.status(404).json({
                error: new Error('Not found. Could not update properly.')
            })
        });   

    } else {
        sauce = {
            _id: req.params.id,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            imageUrl: req.body.imageUrl,
            heat: req.body.heat,
        };
    };

    Sauce.updateOne({_id: req.params.id}, sauce)
        .then(() => { 
            res.status(201).json({
            message: 'Sauce successfully updated!'
            });
        })
        .catch(() => { res.status(400).json({
            error: new Error('Unable to make modifications!')
          });
        });
};

exports.removeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if(!sauce) {
                return res.status(404).json({
                    error: new Error('Sauce not found')
                })
            };
            if(sauce.userId !== req.auth.userId) {
                return res.status(400).json({
                    error: new Error('Unauthorized request!')
                })
            };

            const filename = sauce.imageUrl.split('/images/')[1];
            fileSystem.unlink('images/' + filename, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => { res.status(200).json({
                        message: 'Sauce deleted!'
                        });
                    })
                    .catch(() => { res.status(400).json({
                        error: new Error('Unable to delete')
                        });
                    });
            });
        });
};

exports.likeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            
            const likeValue = req.body.like;
            
            const liked = sauce.usersLiked;
            const disliked = sauce.usersDisliked;

            const indexLike = liked.indexOf(req.body.userId);
            const indexDislike = disliked.indexOf(req.body.userId);

            if( likeValue === 0 ) {
                indexDislike >= 0 ? disliked.splice([indexDislike], 1) : null;
                indexLike >= 0 ? liked.splice([indexLike], 1) : null;
            };
            if( likeValue === -1 ) {
                disliked.push(req.body.userId);
            };
            if( likeValue === 1 ) {
                liked.push(req.body.userId);
            };
            
            Sauce.updateOne({_id: sauce._id}, {
                likes: liked.length,
                dislikes: disliked.length,
                usersLiked: liked,
                usersDisliked: disliked
            })
                .then(() => { res.status(200).json({
                    message: 'Successfully set Like/Dislike option'
                    });
                })
                .catch(() => { throw new Error('Could not update') })
        })
        .catch(() => { res.status(400).json({
            error: new Error('Unable to set like/dislike option.')
            })
        })
};
