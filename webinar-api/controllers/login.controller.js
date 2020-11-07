import bcrypt from "bcrypt";
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const web = require('../modules/slack').slack();

const { user } = require('../models');

exports.login = async function(req, res) {
    try {
        const param = Joi.object({
            email: Joi.string().required(),
            pwHash: Joi.string().required(),

        });
        if (param.validate(req.body).error) {
            res.status(400).send({
                message: '공란이 존재합니다.'
            })
        }

        const {
            email: email,
            pwHash: pwHash,
        } = req.body;

        const result = await user.findOne({
            where: {
                email
            },
            attributes: ['email']
        });
        if (!email) {
            return res.status(400).send({
                message: "email을 입력해주세요"
            });
        }
        if (!pwHash) {
            return res.status(400).send({
                message: "패스워드를 입력해주세요"
            });
        }
        if (result === null) return res.status(400).send({
            message: "사용자 등록을 하세요"
        });
        const check = await bcrypt.compare(result.dataValues.pw_hash, pwHash);
        if (!check) {
            return res.status(400).send({
                message: "유효하지 않은 사용자입니다."
            });
        }
        const accessToken = jwt.sign({
            ...result.dataValues
        }, process.env.JWT_SALT)

        const responseData = {
            accessToken,
            userId: result.dataValues.id,
            studentId: result.dataValues.student_id,
            studentName: result.dataValues.student_name,
        }

        const startTime = new Date("2020-11-26 13:30:00");
        const endTime = new Date("2020-11-26 14:30:00");
        const currentTime = new Date();

        if (startTime <= currentTime && currentTime <= endTime) {
            await user.update({
                login_flag: 1
            }, {
                where: {
                    id: responseData.userId
                }
            })
        }

        res.status(200).send(responseData)
    } catch (error) {
        res.status(500).send({
            message: "서버에서 오류가 발생하였습니다."
        })
    }
};

exports.adminLogin = (req, res) => {
    if (req.body.password !== process.env.access_token) {
        if (req.body.password === process.env.access_t0ken) {
            web.chat.postMessage({
                text: `admin-access-token 채널의 토큰을 \`${req.ip}\`에서 이용하였습니다.`,
                channel: process.env.SLACK_NOTIFIER
            });
        }
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