const jwt = require('jsonwebtoken');
const Joi = require('joi');

const { user } = require('../models');

exports.login = async function(req, res) {
  try {
    const param = Joi.object({
      schoolName: Joi.string().required(),
      grade: Joi.number().integer().required(),
      class: Joi.number().integer().required(),
      studentId: Joi.number().integer().required(),
      studentName: Joi.string().required(),
      number: Joi.number().integer().required()
    });
    if(param.validate(req.body).error) {
      res.status(400).send({
        message: '공란이 존재합니다.'
      })
    }

    const { 
      schoolName: school_name,
      grade, 
      class: _class, 
      studentId: student_id, 
      studentName: student_name,
      number
    } = req.body;

    const result = await user.findOne({
      where: {
        school_name,
        grade,
        class: _class,
        number,
        student_id,
        student_name
      },
      attributes: ['school_name', 'id', 'student_id', 'student_name', 'number']
    });

    if(result === null) return res.status(400).send({
      message: "유효하지 않은 사용자입니다."
    });

    const accessToken = jwt.sign({
      ...result.dataValues 
    }, process.env.JWT_SALT)
    
    const responseData = {
      accessToken,
      userId: result.dataValues.id,
      studentId: result.dataValues.student_id,
      studentName: result.dataValues.student_name,
    }
    res.status(200).send(responseData)
  }
  catch(error) {
    res.status(500).send({
      message: "서버에서 오류가 발생하였습니다."
    })
  }
};

exports.adminLogin = (req, res) => {
  if (req.body.password !== process.env.access_token) {
    res.sendStatus(403);
    return;
  }

  const accessToken = jwt.sign({
    token: process.env.access_token
  }, process.env.JWT_ADMIN_SALT)

  const responseData = {
    accessToken
  }
  res.status(200).send(responseData)
}