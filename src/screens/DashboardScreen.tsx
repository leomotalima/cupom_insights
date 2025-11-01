import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View, } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { db } from "../services/firebaseService";

export default function DashboardScreen() {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const snapshot = await getDocs(collection(db, "compras"));
        const itens = snapshot.docs.map((doc) => doc.data());
        const categorias: Record<string, number> = {};

        itens.forEach((item: any) => {
          const categoria = item.categoria || "Outros";
          let valor = 0;

          if (typeof item.valor_total === "string") {
            valor = parseFloat(
              item.valor_total.replace(",", ".").replace(/[^\d.]/g, "")
            );
          } else if (typeof item.valor_total === "number") {
            valor = item.valor_total;
          }

          if (!isNaN(valor)) {
            categorias[categoria] = (categorias[categoria] || 0) + valor;
          }
        });

        const labels = Object.keys(categorias);
        const valores = Object.values(categorias);

        setChartData({
          labels,
          datasets: [{ data: valores }],
        });
      } catch (e) {
        console.error("Erro ao carregar dados do Firestore:", e);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Painel de Gastos</Text>
      <Text style={styles.subtitle}>
        Visualize seus gastos por categoria registrados no Firestore
      </Text>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      )}

      {!loading && chartData && chartData.labels.length > 0 ? (
        <BarChart
          data={chartData}
          width={Dimensions.get("window").width - 30}
          height={300}
          yAxisLabel="R$"
          yAxisSuffix=""
          fromZero
          showValuesOnTopOfBars
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForBackgroundLines: {
              strokeWidth: 1,
              stroke: "#e3e3e3",
            },
          }}
          style={styles.chart}
        />
      ) : (
        !loading && (
          <Text style={styles.noData}>
            Nenhum dado disponível. Capture e analise um cupom para ver o
            gráfico.
          </Text>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: "100%",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  chart: {
    marginVertical: 20,
    borderRadius: 10,
  },
  noData: {
    marginTop: 40,
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
