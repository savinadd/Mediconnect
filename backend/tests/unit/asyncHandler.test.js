const catchAsync = require('../../src/utils/asyncHandler');

describe('catchAsync', () => {
  it('calls next with error if handler returns rejected promise', async () => {
    const err = new Error('async fail');
    const handler = () => Promise.reject(err);
    const mw = catchAsync(handler);
    const next = jest.fn();
    await mw({}, {}, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  it('does not call next if handler resolves', async () => {
    const handler = jest.fn().mockResolvedValue('ok');
    const mw = catchAsync(handler);
    const next = jest.fn();
    await mw('r', 's', next);
    expect(next).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalledWith('r', 's', next);
  });
});
