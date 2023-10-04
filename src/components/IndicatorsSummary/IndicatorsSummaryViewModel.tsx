import { useEffect, useState } from "react";
import axios from "axios";

interface IndicatorCardComplete extends IndicatorCard {
  id: number;
}

const useIndicatorsSummaryViewModel = (model: IndicatorsSummaryModel) => {
  const [indicatorsSummary, setIndicatorsSummary] =
    useState<IndicatorsSummaryModel>(model);

  const [modalFlag, setModalFlag] = useState(false);
  const [indicatorModalStep, setIndicatorModalStep] = useState(0);

  const [unitOptionsFlag, setUnitOptionsFlag] = useState(false);
  const [unit, setUnit] = useState("");
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [superGoal, setSuperGoal] = useState("");
  const [challenge, setChallenge] = useState("");

  const [allIndicatorsArray, setAllIndicatorsArray] = useState<
    Array<IndicatorCardComplete>
  >([]);
  const [indicatorsSearchResultsArray, setIndicatorsSearchResultsArray] =
    useState<Array<IndicatorCardComplete>>([]);
  const [indicatorsSearchValue, setIndicatorsSearchValue] = useState("");
  const [indicatorsSearchID, setIndicatorsSearchID] = useState(0);

  useEffect(() => {
    setIndicatorsSummary(model);

    axios
      .get("http://localhost:3000/indicator/")
      .then((response) => {
        console.log(response);
        setAllIndicatorsArray(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar indicadores:", error);
      });
  }, [model]);

  // Funções para abrir e fechar o modal
  const openModal = () => setModalFlag(true);
  const closeModal = () => setModalFlag(false);

  // Função para mudar a etapa do modal
  const changeModalStep = (step: number) => setIndicatorModalStep(step);

  // Função para abrir ou fechar o select das unidades de medida
  const changeUnitOptionsFlag = () => setUnitOptionsFlag(!unitOptionsFlag);

  // Função para setar a unidade de medida escolhida
  const changeUnit = (newUnity: string) => setUnit(newUnity);

  // Função para mostrar opções de indicadores coerentes com a busca
  const handleSearchIndicators = (e: React.FormEvent<HTMLInputElement>) => {
    setIndicatorsSearchValue(e.currentTarget.value);

    if (indicatorsSearchValue != "") {
      const result = allIndicatorsArray.filter((indicator) =>
        indicator.name.includes(indicatorsSearchValue)
      );

      console.log(result);
      setIndicatorsSearchResultsArray(result);
    } else {
      setIndicatorsSearchResultsArray([]);
    }
  };

  // Função para escolher o indicador ao clicar na opção
  const handleChangeInputValue = (
    indicatorName: string,
    indicatorID: number
  ) => {
    setIndicatorsSearchValue(indicatorName);
    setIndicatorsSearchID(indicatorID);
    setIndicatorsSearchResultsArray([]);
  };

  // Função para pegar o nome dos labels do gráfico
  const getGraphLabels = () => {
    const labelsArray = [] as Array<string>;
    indicatorsSummary.indicatorsArray.forEach((_indicator, index) => {
      labelsArray.push(`#${index + 1}`);
    });
    labelsArray.push("#0");
    return labelsArray;
  };

  // Função para pegar os dados do gráfico
  const getGraphData = () => {
    const dataArray = [0, 0, 0, 0] as Array<number>;
    // Posições do Array = [ goal, superGoal, challenge, not completed ]

    indicatorsSummary.indicatorsArray.forEach((indicator) => {
      if (indicator.progress < indicator.goal) {
        dataArray[3]++;
      } else if (indicator.progress < indicator.superGoal) {
        dataArray[0]++;
      } else if (indicator.progress < indicator.challenge) {
        dataArray[1]++;
      } else {
        dataArray[2]++;
      }
    });

    return dataArray;
  };

  const handleSaveNewIndicator = async () => {
    // 1. Adicionar o novo indicador no DB de indicadores
    await axios
      .post("http://localhost:3000/indicator/", {
        name: name,
        weight: parseFloat(weight),
        type: unit == "Número" ? 0 : unit == "Financeiro" ? 1 : 2,
        meta: unit == "Número" ? parseInt(goal) : parseFloat(goal),
        supermeta:
          unit == "Número" ? parseInt(superGoal) : parseFloat(superGoal),
        desafio: unit == "Número" ? parseInt(challenge) : parseFloat(challenge),
      })
      // 2. Adicionar o indicador na lista de indicadores do colaborador
      .then(function (response) {
        axios
          .post("http://localhost:3000/fazer/", {
            colaborator: indicatorsSummary.colabID,
            indicator: response.data.id,
          })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });

    // 3. Atualizar o front para aparecer o novo indicador na lista
  };
  const handleAttachIndicator = () => {
    // Função de adicionar indicador existente ao colaborador

    // 1. Adicionar o indicador na lista de indicadores do colaborador
    axios
      .post("http://localhost:3000/fazer/", {
        colaborator: indicatorsSummary.colabID,
        indicator: indicatorsSearchID,
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });

    // 2. Atualizar o front para aparecer o novo indicador na lista
  };

  return {
    indicatorsSummary,
    modalFlag,
    openModal,
    closeModal,
    indicatorModalStep,
    changeModalStep,
    unitOptionsFlag,
    changeUnitOptionsFlag,
    unit,
    changeUnit,
    indicatorsSearchResultsArray,
    handleSearchIndicators,
    indicatorsSearchValue,
    handleChangeInputValue,
    getGraphLabels,
    getGraphData,
    handleSaveNewIndicator,
    handleAttachIndicator,
    setName,
    setWeight,
    setGoal,
    setSuperGoal,
    setChallenge,
  };
};

export default useIndicatorsSummaryViewModel;
