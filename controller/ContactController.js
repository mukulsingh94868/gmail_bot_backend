import Contact from "../model/contactModel.js";

export const createMailSend = async (req, res) => {
  try {
    const { name, email, description } = req.body;

    // Validation
    if (!name || !email || !description) {
      return res.status(400).json({
        message: "All fields (name, email, description) are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if email already exists
    const existingContact = await Contact.findOne({ email: email.trim() });
    if (existingContact) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newContact = new Contact({
      name: name.trim(),
      email: email.trim(),
      description: description.trim(),
    });
    await newContact.save();
    res.status(201).json({
      statusCode: 201,
      message: "Contact created successfully",
      contact: newContact,
    });
  } catch (error) {
    console.log("error", error);
    res
      .status(500)
      .json({ message: "Error creating contact", error: error.message });
  }
};

export const getMailList = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({
      statusCode: 200,
      message: "Contacts fetched successfully",
      data: contacts,
    });
  } catch (error) {
    console.log("error", error);
    res
      .status(500)
      .json({ message: "Error fetching contacts", error: error.message });
  }
};
