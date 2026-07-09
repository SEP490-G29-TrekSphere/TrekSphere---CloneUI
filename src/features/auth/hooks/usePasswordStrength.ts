import type { ZxcvbnResult } from '@zxcvbn-ts/core';
import { useEffect, useMemo, useState } from 'react';

export type StrengthScore = 0 | 1 | 2 | 3 | 4;

type ZxcvbnFunction = (password: string, userInputs?: string[]) => ZxcvbnResult;

const viTranslations = {
  warnings: {
    straightRow: 'Các phím nằm thẳng hàng rất dễ đoán',
    keyPattern: 'Các phím gần nhau rất dễ đoán',
    simpleRepeat: 'Các ký tự lặp lại như "aaa" rất dễ đoán',
    extendedRepeat: 'Các ký tự lặp lại mở rộng rất dễ đoán',
    sequences: 'Các chuỗi tuần tự như "abc" rất dễ đoán',
    recentYears: 'Các năm gần đây rất dễ đoán',
    dates: 'Ngày tháng rất dễ đoán',
    topTen: 'Đây là một trong 10 mật khẩu phổ biến nhất',
    topHundred: 'Đây là một trong 100 mật khẩu phổ biến nhất',
    common: 'Đây là mật khẩu cực kỳ phổ biến',
    similarToCommon: 'Mật khẩu này tương tự như một mật khẩu phổ biến',
    wordByItself: 'Một từ đứng riêng lẻ rất dễ đoán',
    namesByThemselves: 'Tên riêng đứng riêng lẻ rất dễ đoán',
    commonNames: 'Tên phổ biến rất dễ đoán',
    userInputs: 'Mật khẩu chứa thông tin cá nhân của bạn',
    pwned: 'Mật khẩu này đã bị lộ trong các vụ rò rỉ dữ liệu',
  },
  suggestions: {
    l33t: 'Tránh sử dụng các ký tự thay thế l33t phổ biến',
    reverseWords: 'Tránh viết ngược các từ thông dụng',
    allUppercase: 'Tránh viết hoa toàn bộ mật khẩu',
    capitalization: 'Tránh chỉ viết hoa chữ cái đầu',
    dates: 'Tránh sử dụng ngày tháng năm sinh liên quan đến bạn',
    recentYears: 'Tránh sử dụng các năm gần đây',
    associatedYears: 'Tránh sử dụng các năm liên quan đến bạn',
    sequences: 'Tránh các chuỗi ký tự liên tiếp',
    repeated: 'Tránh lặp lại các từ và ký tự',
    longerKeyboardPattern: 'Sử dụng mẫu bàn phím dài hơn với nhiều ngắt quãng hơn',
    anotherWord: 'Thêm một hoặc hai từ nữa. Từ ít phổ biến sẽ tốt hơn.',
    useWords: 'Hãy thử dùng một cụm từ đầy đủ gồm nhiều từ',
    noNeed: 'Không cần sử dụng ký tự đặc biệt, số hoặc viết hoa phức tạp',
    pwned: 'Mật khẩu của bạn đã bị rò rỉ, hãy đổi sang mật khẩu khác',
  },
  timeEstimation: {
    ltSecond: 'dưới một giây',
    second: '1 giây',
    seconds: '{base} giây',
    minute: '1 phút',
    minutes: '{base} phút',
    hour: '1 giờ',
    hours: '{base} giờ',
    day: '1 ngày',
    days: '{base} ngày',
    month: '1 tháng',
    months: '{base} tháng',
    year: '1 năm',
    years: '{base} năm',
    centuries: 'nhiều thế kỷ',
  },
};

// Module-level cached loader promise for zxcvbn function
let zxcvbnPromise: Promise<ZxcvbnFunction> | null = null;

function getZxcvbnFunction(): Promise<ZxcvbnFunction> {
  if (!zxcvbnPromise) {
    zxcvbnPromise = Promise.all([
      import('@zxcvbn-ts/core'),
      import('@zxcvbn-ts/language-common'),
      import('@zxcvbn-ts/language-en'),
    ])
      .then(([{ ZxcvbnFactory }, common, en]) => {
        const factory = new ZxcvbnFactory({
          dictionary: {
            ...common.dictionary,
            ...en.dictionary,
          },
          graphs: common.adjacencyGraphs,
          translations: viTranslations,
        });
        return (pwd: string, inputs?: string[]) => factory.check(pwd, inputs);
      })
      .catch((error) => {
        zxcvbnPromise = null;
        throw error;
      });
  }
  return zxcvbnPromise;
}

// Simple debounce hook for React state/values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function usePasswordStrength(password: string, userInputs?: string[]) {
  const [zxcvbn, setZxcvbn] = useState<{ fn: ZxcvbnFunction } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadZxcvbn() {
      try {
        const fn = await getZxcvbnFunction();
        if (!active) return;
        setZxcvbn({ fn });
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load zxcvbn-ts', error);
        if (active) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }

    void loadZxcvbn();

    return () => {
      active = false;
    };
  }, []);

  // Solve the array-reference re-render issue by joining the elements into a stable string key
  const userInputsKey = userInputs ? userInputs.join('|') : '';

  // Debounce inputs to prevent typing lag
  const debouncedPassword = useDebounce(password, 250);
  const debouncedUserInputsKey = useDebounce(userInputsKey, 250);

  const debouncedUserInputs = useMemo(() => {
    return debouncedUserInputsKey ? debouncedUserInputsKey.split('|') : undefined;
  }, [debouncedUserInputsKey]);

  const result = useMemo(() => {
    if (!zxcvbn || !debouncedPassword) return null;
    return zxcvbn.fn(debouncedPassword, debouncedUserInputs);
  }, [zxcvbn, debouncedPassword, debouncedUserInputs]);

  return {
    isLoading,
    hasError,
    score: (result ? result.score : 0) as StrengthScore,
    feedback: result ? result.feedback : null,
  };
}
