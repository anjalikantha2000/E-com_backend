const { About, TeamMember, Blog, Contact } = require('../models/Content');

// About Routes
exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne({ isActive: true });
    if (!about) {
      return res.status(404).json({
        message: 'About content not found'
      });
    }
    res.json({
      about
    });
  } catch (error) {
    console.error('Get about error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const updatedAbout = await About.findOneAndUpdate(
      { isActive: true },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json({
      message: 'About content updated successfully',
      about: updatedAbout
    });
  } catch (error) {
    console.error('Update about error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Team Routes
exports.getTeam = async (req, res) => {
  try {
    const team = await TeamMember.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    res.json({
      team
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.createTeamMember = async (req, res) => {
  try {
    const teamMember = new TeamMember(req.body);
    await teamMember.save();

    res.status(201).json({
      message: 'Team member created successfully',
      teamMember
    });
  } catch (error) {
    console.error('Create team member error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const updatedMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({
        message: 'Team member not found'
      });
    }

    res.json({
      message: 'Team member updated successfully',
      teamMember: updatedMember
    });
  } catch (error) {
    console.error('Update team member error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const deletedMember = await TeamMember.findByIdAndDelete(req.params.id);

    if (!deletedMember) {
      return res.status(404).json({
        message: 'Team member not found'
      });
    }

    res.json({
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Blog Routes
exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, published = 'true' } = req.query;

    const query = {};
    if (published === 'true') query.isPublished = true;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog
      .find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBlogs: total
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name');

    if (!blog) {
      return res.status(404).json({
        message: 'Blog not found'
      });
    }

    res.json({
      blog
    });
  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user.userId
    };

    const blog = new Blog(blogData);
    await blog.save();

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('author', 'name');

    if (!updatedBlog) {
      return res.status(404).json({
        message: 'Blog not found'
      });
    }

    res.json({
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) {
      return res.status(404).json({
        message: 'Blog not found'
      });
    }

    res.json({
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Contact Routes
exports.submitContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contact
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contacts = await Contact
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('assignedTo', 'name');

    const total = await Contact.countDocuments(query);

    res.json({
      contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalContacts: total
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('assignedTo', 'name');

    if (!updatedContact) {
      return res.status(404).json({
        message: 'Contact not found'
      });
    }

    res.json({
      message: 'Contact updated successfully',
      contact: updatedContact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const deletedContact = await Contact.findByIdAndDelete(req.params.id);

    if (!deletedContact) {
      return res.status(404).json({
        message: 'Contact not found'
      });
    }

    res.json({
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};