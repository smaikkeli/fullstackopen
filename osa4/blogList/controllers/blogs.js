const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', {username: 1, name: 1})

  response.json(blogs)
})
  
blogsRouter.post('/', async (request, response) => {
  
  const body = request.body
  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  })

  const savedBlog = await blog.save()
  await savedBlog.populate('user', {username: 1, name: 1})

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id/', async (request, response) => {

  const user = request.user
  const blog = await Blog.findByIdAndDelete(request.params.id)

  if (blog.user.toString() === user._id.toString()) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id/', async (request, response, next) => {

  const body = request.body
  
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, blog, { new : true })
    .populate('user', {username: 1, name: 1})

  response.json(updatedBlog)
})

module.exports = blogsRouter