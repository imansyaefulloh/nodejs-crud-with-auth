const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// load idea model
const Idea = require('../models/Idea');

router.get('/', (req, res) => {
  Idea.find({})
    .sort({ date: 'desc' })
    .then(ideas => {
      res.render('ideas/index', { ideas });
    })
    .catch(err => console.log(err));
});

router.get('/add', (req, res) => {
  res.render('ideas/add');
});

router.post('/', (req, res) => {
  let errors = [];
  if (!req.body.title) {
    errors.push({ text: 'Title is required' });
  }
  if (!req.body.details) {
    errors.push({ text: 'Details is required' });
  }

  if (errors.length > 0) {
    res.render('ideas/add', {
      errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const { title, details } = req.body;
    const newIdea = {
      title,
      details
    };
    new Idea(newIdea)
      .save()
      .then(idea => {
        req.flash('success_msg', 'Idea created');
        res.redirect('ideas')
      })
      .catch(err => console.log(err));

  }
});

router.get('/edit/:id', (req, res) => {
  Idea.findOne({ _id: req.params.id })
    .then(idea => {
      res.render('ideas/edit', { idea });
    })
    .catch(err => console.log(err));
});

router.put('/:id', (req, res) => {
  Idea.findOne({ _id: req.params.id })
    .then(idea => {
      idea.title = req.body.title;
      idea.details = req.body.details;

      idea.save()
        .then(updatedIdea => {
          req.flash('success_msg', 'Idea updated');
          res.redirect('/ideas');
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

router.delete('/:id', (req, res) => {
  Idea.remove({ _id: req.params.id })
    .then(idea => {
      req.flash('success_msg', 'Idea removed');
      res.redirect('/ideas');
    })
    .catch(err => console.log(err));
});

module.exports = router;