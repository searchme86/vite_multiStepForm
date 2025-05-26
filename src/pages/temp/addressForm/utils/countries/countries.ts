import countriesData from './countries.json';

// 코드의 의미: 국가 데이터 타입 정의
// 왜 사용했는지: 국가 데이터 구조를 타입으로 관리
type Country = {
  name: string;
  code: string;
  states: { name: string; cities: string[] }[];
};

// 코드의 의미: 국가 데이터를 관리하는 싱글톤 클래스
// 왜 사용했는지: 메모리 효율성을 높이고 전역적으로 동일한 데이터 공유
class CountryDataLoader {
  // 코드의 의미: 국가 데이터를 저장하는 Map 객체
  // 왜 사용했는지: 빠른 검색을 위해 Map 사용
  private countriesMap: Map<string, Country>;

  // 코드의 의미: 싱글톤 인스턴스
  // 왜 사용했는지: 단일 인스턴스 보장
  private static _instance: CountryDataLoader;

  // 코드의 의미: 생성자
  // 왜 사용했는지: 초기화 및 데이터 로드
  private constructor() {
    this.countriesMap = new Map();
    this.load();
  }

  // 코드의 의미: 싱글톤 인스턴스 반환
  // 왜 사용했는지: 단일 인스턴스 접근 제공
  public static getInstance(): CountryDataLoader {
    if (!CountryDataLoader._instance) {
      CountryDataLoader._instance = new CountryDataLoader();
    }
    return CountryDataLoader._instance;
  }

  // 코드의 의미: 국가 데이터 로드
  // 왜 사용했는지: countries.json 데이터를 Map에 로드
  private load(): void {
    const countries: { [key: string]: Country } = countriesData;

    for (const countryKey in countries) {
      const lowerKey = countryKey?.toLowerCase();
      this.countriesMap.set(lowerKey, countries[countryKey]);
    }
  }

  // 코드의 의미: 국가 존재 여부 확인
  // 왜 사용했는지: 주어진 국가 코드가 존재하는지 확인
  public countryExists(countryCode: string): boolean {
    return this.countriesMap.has(countryCode?.toLowerCase());
  }

  // 코드의 의미: 국가 데이터 반환
  // 왜 사용했는지: 주어진 국가 코드에 해당하는 데이터 반환
  public getCountryData(countryCode: string): Country | undefined {
    return this.countriesMap.get(countryCode?.toLowerCase());
  }

  // 코드의 의미: 모든 국가 이름 목록 반환
  // 왜 사용했는지: 국가 선택 드롭다운에서 사용
  public countryNames(): Country[] {
    return Array.from(this.countriesMap.values());
  }

  // 코드의 의미: 국가별 주/도 목록 반환
  // 왜 사용했는지: 국가 선택 시 주/도 드롭다운 데이터 제공
  public getStateNames(countryCode: string): string[] {
    const countryData = this.getCountryData(countryCode);
    return countryData?.states.map((state) => state.name) || [];
  }

  // 코드의 의미: 주/도별 도시 목록 반환
  // 왜 사용했는지: 주/도 선택 시 도시 드롭다운 데이터 제공
  public getCityNames(countryCode: string, stateName: string): string[] {
    const countryData = this.getCountryData(countryCode);
    const stateData = countryData?.states.find(
      (state) => state.name.toLowerCase() === stateName.toLowerCase()
    );
    return stateData?.cities || [];
  }
}

// 코드의 의미: 싱글톤 인스턴스 생성 및 내보내기
// 왜 사용했는지: 전역적으로 사용 가능한 Country 객체 제공
export const Country = CountryDataLoader.getInstance();

// 코드의 의미: 모든 국가 이름 목록 내보내기
// 왜 사용했는지: 국가 선택 드롭다운에서 사용
export const countryNames = Country.countryNames();
