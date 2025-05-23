from flask import Flask, render_template, request
import math
import matplotlib.pyplot as plt
from scipy.optimize import fsolve
import os

app = Flask(__name__)

def resolver_tensiones(angulo_a, angulo_b, masa, g=10):
    a = math.radians(angulo_a)
    b = math.radians(angulo_b)
    peso = masa * g

    def ecuacion_t2(t2):
        t1 = (-math.cos(b) * t2) / math.cos(a)
        return (t1 * math.sin(a) + t2 * math.sin(b)) - peso

    t2_inicial = 10
    t2 = fsolve(ecuacion_t2, t2_inicial)[0]
    t1 = (-math.cos(b) * t2) / math.cos(a)
    t3 = peso

    return t1, t2, t3, a, b

def graficar_direcciones(a, b):
    longitud = 1
    T1_x = math.cos(a) * longitud
    T1_y = math.sin(a) * longitud
    T2_x = math.cos(b) * longitud
    T2_y = math.sin(b) * longitud
    T3_x = 0
    T3_y = -1

    plt.figure(figsize=(5, 5))
    plt.quiver(0, 0, T1_x, T1_y, angles='xy', scale_units='xy', scale=1, color='blue', label='T1')
    plt.quiver(0, 0, T2_x, T2_y, angles='xy', scale_units='xy', scale=1, color='green', label='T2')
    plt.quiver(0, 0, T3_x, T3_y, angles='xy', scale_units='xy', scale=1, color='red', label='T3')
    plt.xlim(-1.5, 1.5)
    plt.ylim(-1.5, 1.5)
    plt.grid(True)
    plt.gca().set_aspect('equal', adjustable='box')
    plt.title('Direcciones de Tensiones')
    plt.legend()

    os.makedirs("static", exist_ok=True)
    ruta = os.path.join("static", "grafico.png")
    plt.savefig(ruta)
    plt.close()

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        try:
            angulo_a = float(request.form["anguloA"])
            angulo_b = float(request.form["anguloB"])
            masa = float(request.form["masa"])

            t1, t2, t3, a_rad, b_rad = resolver_tensiones(angulo_a, angulo_b, masa)
            graficar_direcciones(a_rad, b_rad)

            return render_template("index.html",
                                   t1=round(t1, 2),
                                   t2=round(t2, 2),
                                   t3=round(t3, 2),
                                   mostrar=True)
        except Exception as e:
            return render_template("index.html", error=str(e), mostrar=False)

    return render_template("index.html", mostrar=False)

if __name__ == "__main__":
    app.run(debug=True)