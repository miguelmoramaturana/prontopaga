import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { config } from '../config';
import { computeScore } from '../utils/score';

const app = createApp();

async function login(username: string, password: string) {
  const res = await request(app).post('/login').send({ username, password });
  return res;
}

describe('POST /login', () => {
  it('devuelve un token para credenciales válidas de admin (sin rut)', async () => {
    const res = await login('admin', 'admin123');
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
    const payload = jwt.decode(res.body.token) as jwt.JwtPayload;
    expect(payload.sub).toBe('1');
    expect(payload.role).toBe('admin');
    expect(payload.rut).toBeUndefined();
  });

  it('incluye el rut en el token para el rol user', async () => {
    const res = await login('user', 'user123');
    const payload = jwt.decode(res.body.token) as jwt.JwtPayload;
    expect(payload.role).toBe('user');
    expect(payload.rut).toBe('12.345.678-9');
  });

  it('rechaza credenciales inválidas con 401', async () => {
    const res = await login('user', 'mala');
    expect(res.status).toBe(401);
  });

  it('rechaza payload incompleto con 400', async () => {
    const res = await request(app).post('/login').send({ username: 'user' });
    expect(res.status).toBe(400);
  });
});

describe('GET /score/:rut', () => {
  it('exige autenticación (401 sin token)', async () => {
    const res = await request(app).get('/score/12.345.678-9');
    expect(res.status).toBe(401);
  });

  it('rechaza un token con firma inválida', async () => {
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', 'Bearer token.falso.aqui');
    expect(res.status).toBe(401);
  });

  it('rechaza un token expirado', async () => {
    const expired = jwt.sign({ sub: '2', role: 'user', rut: '12.345.678-9' }, config.jwtSecret, {
      expiresIn: -10,
    });
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('permite a un user consultar su propio RUT', async () => {
    const { body } = await login('user', 'user123');
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ rut: '12.345.678-9', score: computeScore('12.345.678-9') });
    expect(typeof res.body.fecha).toBe('string');
  });

  it('bloquea a un user que consulta un RUT ajeno (403)', async () => {
    const { body } = await login('user', 'user123');
    const res = await request(app)
      .get('/score/9.876.543-3')
      .set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(403);
  });

  it('permite a un admin consultar cualquier RUT', async () => {
    const { body } = await login('admin', 'admin123');
    const res = await request(app)
      .get('/score/9.876.543-3')
      .set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.rut).toBe('9.876.543-3');
  });

  it('acepta el RUT sin puntos y lo normaliza en la respuesta', async () => {
    const { body } = await login('admin', 'admin123');
    const res = await request(app)
      .get('/score/123456785')
      .set('Authorization', `Bearer ${body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.rut).toBe('12.345.678-5');
  });
});

describe('computeScore', () => {
  it('es determinista para el mismo RUT', () => {
    expect(computeScore('12.345.678-9')).toBe(computeScore('12345678-9'));
  });

  it('varía entre RUTs distintos', () => {
    expect(computeScore('12.345.678-9')).not.toBe(computeScore('9.876.543-3'));
  });

  it('siempre está en el rango [0, 100]', () => {
    for (const n of ['1-9', '999.999.999-9', '5.555.555-5', '18.765.432-1']) {
      const s = computeScore(n);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });
});
