/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { assert } = require('chai');
const nock = require('nock');
const error = require('../../../lib/error');
const { mockLog } = require('../../mocks');

const subhubModule = require('../../../lib/subhub/client');

const mockConfig = {
  publicUrl: 'https://accounts.example.com',
  subhub: {
    enabled: true,
    url: 'https://foo.bar',
    key: 'foo',
  },
};

const mockServer = nock(mockConfig.subhub.url, {
  reqheaders: {
    Authorization: mockConfig.subhub.key,
  },
}).defaultReplyHeaders({
  'Content-Type': 'application/json',
});

describe('subhub client', () => {
  const ORIG_SYSTEM = 'Firefox Accounts';
  const UID = '8675309';
  const EMAIL = 'foo@example.com';
  const DISPLAY_NAME = 'Foo Barbaz';
  const PLAN_ID = 'plan12345';
  const SUBSCRIPTION_ID = 'sub12345';
  const PAYMENT_TOKEN_GOOD = 'foobarbaz';
  const PAYMENT_TOKEN_NEW = 'quuxxyzzy';
  const PAYMENT_TOKEN_BAD = 'badf00d';

  const makeSubject = (subhubConfig = {}) => {
    const log = mockLog();
    const subhub = subhubModule(log, {
      ...mockConfig,
      subhub: {
        ...mockConfig.subhub,
        ...subhubConfig,
      },
    });
    return { log, subhub };
  };

  afterEach(() => {
    assert.ok(
      nock.isDone(),
      'there should be no pending request mocks at the end of a test'
    );
  });

  it('should build stub API when configured to do so', async () => {
    const { subhub } = makeSubject();
    assert.equal(subhub.isStubAPI, false);

    const { subhub: subhubWithStubs } = makeSubject({ useStubs: true });
    assert.equal(subhubWithStubs.isStubAPI, true);
  });

  it('should throw errors when feature not enabled', async () => {
    const { subhub } = makeSubject({ enabled: false });
    const names = [
      'listPlans',
      'listSubscriptions',
      'createSubscription',
      'getCustomer',
      'updateCustomer',
      'deleteCustomer',
      'cancelSubscription',
      'reactivateSubscription',
    ];
    for (const name of names) {
      try {
        await subhub[name]();
        assert.fail();
      } catch (err) {
        assert.equal(err.message, 'Feature not enabled');
      }
    }
  });

  describe('listPlans', () => {
    it('should list plans', async () => {
      const expected = [
        {
          plan_id: 'firefox_pro_basic_823',
          plan_name: 'Firefox Pro Basic Monthly',
          product_id: 'firefox_pro_basic',
          product_name: 'Firefox Pro Basic',
          interval: 'month',
          amount: 500,
          currency: 'usd',
        },
      ];
      mockServer.get('/v1/plans').reply(200, expected);
      const { subhub } = makeSubject();
      const resp = await subhub.listPlans();
      assert.deepEqual(resp, expected);
    });

    it('should throw on backend service failure', async () => {
      mockServer.get('/v1/plans').reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.listPlans();
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.listPlans.1');
      }
    });
  });

  const mockSubscriptions = () => {
    const mockBody = {
      subscriptions: [
        {
          cancel_at_period_end: false,
          current_period_start: 1557161022,
          current_period_end: 1557361022,
          end_at: null,
          plan_name: 'Example',
          plan_id: 'firefox_pro_basic_823',
          status: 'active',
          subscription_id: 'sub_8675309',
        },
      ],
    };

    const expected = mockBody;

    return { mockBody, expected };
  };

  describe('listSubscriptions', () => {
    it('should list subscriptions for account', async () => {
      const { mockBody, expected } = mockSubscriptions();
      mockServer.get(`/v1/customer/${UID}/subscriptions`).reply(200, mockBody);
      const { subhub } = makeSubject();
      const resp = await subhub.listSubscriptions(UID);
      assert.deepEqual(resp, expected);
    });

    it('should throw on unknown user', async () => {
      mockServer
        .get(`/v1/customer/${UID}/subscriptions`)
        .reply(404, { message: 'invalid uid' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.listSubscriptions(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(
          log.error.getCall(0).args[0],
          'subhub.listSubscriptions.1'
        );
      }
    });

    it('should throw on invalid response', async () => {
      const mockBody = { subscriptions: 'this is not right' };
      mockServer.get(`/v1/customer/${UID}/subscriptions`).reply(200, mockBody);
      const { log, subhub } = makeSubject();
      try {
        await subhub.listSubscriptions(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.INTERNAL_VALIDATION_ERROR);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.listSubscriptions');
        assert.equal(
          log.error.getCall(0).args[1].error,
          'response schema validation failed'
        );
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer
        .get(`/v1/customer/${UID}/subscriptions`)
        .reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.listSubscriptions(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(
          log.error.getCall(0).args[0],
          'subhub.listSubscriptions.1'
        );
      }
    });
  });

  describe('createSubscription', () => {
    it('should subscribe to a plan with valid payment token', async () => {
      const { mockBody, expected } = mockSubscriptions();
      const expectedBody = {
        orig_system: ORIG_SYSTEM,
        pmt_token: PAYMENT_TOKEN_GOOD,
        plan_id: PLAN_ID,
        display_name: DISPLAY_NAME,
        email: EMAIL,
      };
      let requestBody;
      mockServer
        .post(`/v1/customer/${UID}/subscriptions`, body => (requestBody = body))
        .reply(201, mockBody);
      const { subhub } = makeSubject();
      const resp = await subhub.createSubscription(
        UID,
        PAYMENT_TOKEN_GOOD,
        PLAN_ID,
        DISPLAY_NAME,
        EMAIL
      );
      assert.deepEqual(requestBody, expectedBody);
      assert.deepEqual(resp, expected);
    });

    it('should throw on unknown plan ID', async () => {
      mockServer
        .post(`/v1/customer/${UID}/subscriptions`)
        // TODO: update with subhub createSubscription error response for invalid plan ID
        .reply(404, { message: 'invalid plan id' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.createSubscription(
          UID,
          PAYMENT_TOKEN_BAD,
          PLAN_ID,
          DISPLAY_NAME,
          EMAIL
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_PLAN);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(
          log.error.getCall(0).args[0],
          'subhub.createSubscription.1'
        );
      }
    });

    it('should throw on invalid payment token', async () => {
      mockServer
        .post(`/v1/customer/${UID}/subscriptions`)
        // TODO: update with subhub createSubscription error response for invalid payment token
        .reply(400, { message: 'invalid payment token' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.createSubscription(
          UID,
          PAYMENT_TOKEN_BAD,
          PLAN_ID,
          DISPLAY_NAME,
          EMAIL
        );
        assert.fail();
      } catch (err) {
        assert.equal(
          err.errno,
          error.ERRNO.REJECTED_SUBSCRIPTION_PAYMENT_TOKEN
        );
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(
          log.error.getCall(0).args[0],
          'subhub.createSubscription.1'
        );
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer
        .post(`/v1/customer/${UID}/subscriptions`)
        .reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.createSubscription(
          UID,
          PAYMENT_TOKEN_GOOD,
          PLAN_ID,
          DISPLAY_NAME,
          EMAIL
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(
          log.error.getCall(0).args[0],
          'subhub.createSubscription.1'
        );
      }
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel an existing subscription', async () => {
      const expected = { message: 'Subscription cancellation successful' };
      mockServer
        .delete(`/v1/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(201, expected);
      const { subhub } = makeSubject();
      const result = await subhub.cancelSubscription(UID, SUBSCRIPTION_ID);
      assert.deepEqual(result, expected);
    });

    it('should throw on unknown user', async () => {
      mockServer
        .delete(`/v1/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(404, { message: 'invalid uid' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.cancelSubscription(UID, SUBSCRIPTION_ID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(
          log.error.getCall(0).args[0],
          'subhub.cancelSubscription.1'
        );
      }
    });

    it('should throw on unknown subscription', async () => {
      mockServer
        .delete(`/v1/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(400, { message: 'invalid subscription id' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.cancelSubscription(UID, SUBSCRIPTION_ID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(
          log.error.getCall(0).args[0],
          'subhub.cancelSubscription.1'
        );
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer
        .delete(`/v1/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.cancelSubscription(UID, SUBSCRIPTION_ID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(
          log.error.getCall(0).args[0],
          'subhub.cancelSubscription.1'
        );
      }
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate a cancelled subscription', async () => {
      const expected = { message: 'wibble' };
      mockServer
        .post(`/v1/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(201, expected);
      const { subhub } = makeSubject();
      const result = await subhub.reactivateSubscription(UID, SUBSCRIPTION_ID);
      assert.deepEqual(result, expected);
    });

    it('should throw on unknown user', async () => {
      mockServer
        .post(`/v1/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(404, { message: 'invalid uid' });
      const { subhub } = makeSubject();

      let failed = false;

      try {
        await subhub.reactivateSubscription(UID, SUBSCRIPTION_ID);
      } catch (err) {
        failed = true;

        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }

      assert.isTrue(failed);
    });

    it('should throw on unknown user', async () => {
      mockServer
        .post(`/v1/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(404, { message: 'invalid subscription id' });
      const { subhub } = makeSubject();

      let failed = false;

      try {
        await subhub.reactivateSubscription(UID, SUBSCRIPTION_ID);
      } catch (err) {
        failed = true;

        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION);
      }

      assert.isTrue(failed);
    });

    it('should throw on backend service failure', async () => {
      mockServer
        .post(`/v1/customer/${UID}/subscriptions/${SUBSCRIPTION_ID}`)
        .reply(500, 'Internal Server Error');
      const { subhub } = makeSubject();

      let failed = false;

      try {
        await subhub.reactivateSubscription(UID, SUBSCRIPTION_ID);
      } catch (err) {
        failed = true;

        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
      }

      assert.isTrue(failed);
    });
  });

  describe('getCustomer', () => {
    it('should yield customer details', async () => {
      const expected = {
        payment_type: 'card',
        last4: '8675',
        exp_month: 8,
        exp_year: 2020,
        subscriptions: [],
      };
      mockServer.get(`/v1/customer/${UID}`).reply(200, expected);
      const { subhub } = makeSubject();
      const resp = await subhub.getCustomer(UID);
      assert.deepEqual(resp, expected);
    });

    it('should throw on unknown user', async () => {
      mockServer
        .get(`/v1/customer/${UID}`)
        .reply(404, { message: 'invalid uid' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.getCustomer(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.getCustomer.1');
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer.get(`/v1/customer/${UID}`).reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.getCustomer(UID);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.getCustomer.1');
      }
    });
  });

  describe('updateCustomer', () => {
    it('should update payment method', async () => {
      const expected = {
        exp_month: 12,
        exp_year: 2020,
        last4: '8675',
        payment_type: 'credit',
        subscriptions: [],
      };
      const expectedBody = {
        pmt_token: PAYMENT_TOKEN_NEW,
      };
      let requestBody;
      mockServer
        .post(`/v1/customer/${UID}`, body => (requestBody = body))
        .reply(201, expected);
      const { subhub } = makeSubject();
      const resp = await subhub.updateCustomer(UID, PAYMENT_TOKEN_NEW);
      assert.deepEqual(requestBody, expectedBody);
      assert.deepEqual(resp, expected);
    });

    it('should throw on unknown user', async () => {
      mockServer
        .post(`/v1/customer/${UID}`)
        .reply(404, { message: 'invalid uid' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.updateCustomer(UID, PAYMENT_TOKEN_NEW);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.updateCustomer.1');
      }
    });

    it('should throw on invalid payment token', async () => {
      mockServer
        .post(`/v1/customer/${UID}`)
        .reply(400, { message: 'invalid payment token' });
      const { log, subhub } = makeSubject();
      try {
        await subhub.updateCustomer(UID, PAYMENT_TOKEN_NEW);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.REJECTED_CUSTOMER_UPDATE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.updateCustomer.1');
      }
    });

    it('should throw on backend service failure', async () => {
      mockServer
        .post(`/v1/customer/${UID}`)
        .reply(500, 'Internal Server Error');
      const { log, subhub } = makeSubject();
      try {
        await subhub.updateCustomer(UID, PAYMENT_TOKEN_NEW);
        assert.fail();
      } catch (err) {
        assert.equal(err.errno, error.ERRNO.BACKEND_SERVICE_FAILURE);
        assert.equal(log.error.callCount, 1, 'an error was logged');
        assert.equal(log.error.getCall(0).args[0], 'subhub.updateCustomer.1');
      }
    });
  });

  describe('deleteCustomer', () => {
    it('should not fail for valid user', async () => {
      mockServer
        .delete(`/v1/customer/${UID}`)
        .reply(200, { message: 'wibble' });
      const { subhub } = makeSubject();
      const response = await subhub.deleteCustomer(UID);
      assert.deepEqual(response, { message: 'wibble' });
    });

    it('should throw on unknown user', async () => {
      mockServer
        .delete(`/v1/customer/${UID}`)
        .reply(404, { message: 'invalid uid' });
      const { subhub } = makeSubject();

      let failed = false;

      try {
        await subhub.deleteCustomer(UID);
      } catch (err) {
        failed = true;

        assert.equal(err.errno, error.ERRNO.UNKNOWN_SUBSCRIPTION_CUSTOMER);
      }

      assert.isTrue(failed);
    });
  });
});
