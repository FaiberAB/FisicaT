from flask import Flask, request, render_template_string, send_from_directory
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

    plt.savefig("grafico.png")
    plt.close()

@app.route("/", methods=["GET", "POST"])
def index():
    html = open("index.html", encoding="utf-8").read()

    if request.method == "POST":
        try:
            angulo_a = float(request.form["anguloA"])
            angulo_b = float(request.form["anguloB"])
            masa = float(request.form["masa"])

            t1, t2, t3, a_rad, b_rad = resolver_tensiones(angulo_a, angulo_b, masa)
            graficar_direcciones(a_rad, b_rad)

            return render_template_string(html,
                                          t1=round(t1, 2),
                                          t2=round(t2, 2),
                                          t3=round(t3, 2),
                                          mostrar=True,
                                          error=None)
        except Exception as e:
            return render_template_string(html, mostrar=False, error=str(e))

    return render_template_string(html, mostrar=False, error=None)

@app.route('/style.css')
def css():
    return send_from_directory('.', 'style.css')

@app.route('/grafico.png')
def grafico():
    return send_from_directory('.', 'grafico.png')

if __name__ == "__main__":
    app.run(debug=True)
