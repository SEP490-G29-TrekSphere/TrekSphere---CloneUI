import { getCheckpointImageUrls } from './shared';

describe('getCheckpointImageUrls', () => {
  test('ưu tiên danh sách ảnh đã được API tách sẵn', () => {
    expect(
      getCheckpointImageUrls({
        checkpointImageUrl: 'https://old.example/combined.jpg',
        checkpointImageUrls: [' https://cdn.example/one.jpg ', 'https://cdn.example/two.jpg'],
      })
    ).toEqual(['https://cdn.example/one.jpg', 'https://cdn.example/two.jpg']);
  });

  test('tách chuỗi ảnh cũ và loại bỏ URL trùng lặp', () => {
    expect(
      getCheckpointImageUrls({
        checkpointImageUrl:
          'https://cdn.example/one.jpg, https://cdn.example/two.jpg, https://cdn.example/one.jpg',
      })
    ).toEqual(['https://cdn.example/one.jpg', 'https://cdn.example/two.jpg']);
  });
});
